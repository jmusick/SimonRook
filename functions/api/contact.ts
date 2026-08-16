/**
 * Contact form endpoint — POST /api/contact
 *
 * A Cloudflare Pages Function. This is the site's only server-side code; the
 * rest of the site is static (see AGENTS.md). It exists because sending mail
 * requires an API token, and a token cannot be shipped to a browser.
 *
 * Mail goes out through the Cloudflare Email Sending REST API, the same path
 * the Tagstash project uses. Integration notes worth keeping:
 *
 * - Token needs the `Email Sending: Edit` permission, scoped to the account.
 * - Reply-to is the snake_case top-level field `reply_to`. A camelCase
 *   `replyTo` 400s with `invalid_request_schema`, and a `headers: {'Reply-To'}`
 *   object 400s with `email.invalid`. Neither is clearly documented — don't
 *   "fix" the casing below.
 * - The `from` domain must be connected and verified in the dashboard first.
 * - Success is `data.success`, not merely a 2xx.
 */

interface Env {
	CLOUDFLARE_API_TOKEN?: string;
	CLOUDFLARE_ACCOUNT_ID?: string;
	EMAIL_FROM_CONTACT?: string;
	CONTACT_TO_EMAIL?: string;
	TURNSTILE_SECRET_KEY?: string;
}

interface ContactPayload {
	name?: unknown;
	email?: unknown;
	subject?: unknown;
	message?: unknown;
	captchaToken?: unknown;
	/** Honeypot — a real person never fills this in; see the form markup. */
	website?: unknown;
}

const LIMITS = {
	name: 100,
	subject: 150,
	messageMin: 10,
	messageMax: 4000,
} as const;

/** Sender must be on a verified Email Sending domain; overridable per environment. */
const DEFAULT_FROM = "contact@simonrook.com";
/** Destination inbox — keep in step with CONTACT_EMAIL in src/config/site.ts. */
const DEFAULT_TO = "hello@simonrook.com";

const json = (payload: Record<string, unknown>, status = 200): Response =>
	new Response(JSON.stringify(payload), {
		status,
		headers: {
			"Content-Type": "application/json",
			// No CORS headers by design: this backs one form on this origin, so
			// there is no reason for another site to be able to call it.
			"Cache-Control": "no-store",
		},
	});

const asString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

/** Strip CR/LF from anything interpolated into a header-like field. */
const singleLine = (value: string): string => value.replace(/[\r\n]+/g, " ").trim();

const verifyTurnstile = async (
	request: Request,
	env: Env,
	token: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> => {
	if (!env.TURNSTILE_SECRET_KEY) {
		return { ok: false, status: 503, error: "The contact form is not configured." };
	}

	if (!token) {
		return { ok: false, status: 400, error: "Please complete the verification challenge." };
	}

	const body = new URLSearchParams({
		secret: env.TURNSTILE_SECRET_KEY,
		response: token,
	});

	const remoteIp = request.headers.get("CF-Connecting-IP");
	if (remoteIp) body.set("remoteip", remoteIp);

	try {
		const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: body.toString(),
		});
		const data = (await response.json()) as { success?: boolean };

		if (!data?.success) {
			return { ok: false, status: 400, error: "Verification failed. Please try again." };
		}
		return { ok: true };
	} catch {
		return { ok: false, status: 502, error: "Could not reach the verification service." };
	}
};

const sendEmail = async (
	message: { to: string; from: string; subject: string; text: string; html: string; replyTo?: string },
	env: Env,
): Promise<void> => {
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				to: message.to,
				from: message.from,
				subject: message.subject,
				text: message.text,
				html: message.html,
				...(message.replyTo ? { reply_to: message.replyTo } : {}),
			}),
		},
	);

	const data = (await response.json().catch(() => null)) as
		| { success?: boolean; errors?: { message?: string }[] }
		| null;

	if (!response.ok || !data?.success) {
		throw new Error(
			data?.errors?.[0]?.message || `Cloudflare Email Sending error: ${response.status}`,
		);
	}
};

const buildBodies = (fields: { name: string; email: string; subject: string; message: string }) => {
	const text = [
		"New message from the simonrook.com contact form",
		"",
		`Name:    ${fields.name}`,
		`Email:   ${fields.email}`,
		`Subject: ${fields.subject}`,
		"",
		"Message:",
		fields.message,
	].join("\n");

	const safe = {
		name: escapeHtml(fields.name),
		email: escapeHtml(fields.email),
		subject: escapeHtml(fields.subject),
		message: escapeHtml(fields.message),
	};

	const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>Contact form message</title>
  </head>
  <body style="margin:0;padding:24px;background-color:#f3f4f6;color:#111827;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:700px;margin:0 auto;border-collapse:collapse;">
      <tr>
        <td style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;">
          <h2 style="margin:0 0 16px 0;font-size:20px;line-height:1.3;">New message from the contact form</h2>
          <p style="margin:0 0 6px 0;"><strong>Name:</strong> ${safe.name}</p>
          <p style="margin:0 0 6px 0;"><strong>Email:</strong> <a href="mailto:${safe.email}" style="color:#0f172a;">${safe.email}</a></p>
          <p style="margin:0 0 16px 0;"><strong>Subject:</strong> ${safe.subject}</p>
          <div style="white-space:pre-wrap;background-color:#f9fafb;border:1px solid #e5e7eb;padding:12px;border-radius:8px;">${safe.message}</div>
          <p style="margin:16px 0 0 0;font-size:13px;color:#6b7280;">Reply directly to this email to answer the sender.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

	return { text, html };
};

const handlePost = async (request: Request, env: Env): Promise<Response> => {
	let payload: ContactPayload;
	try {
		payload = (await request.json()) as ContactPayload;
	} catch {
		return json({ error: "Malformed request." }, 400);
	}

	// Honeypot: bots fill every field they find. Answer 200 so they don't learn
	// anything from the failure, but send nothing.
	if (asString(payload.website)) {
		return json({ message: "Thanks — your message has been sent." });
	}

	const name = singleLine(asString(payload.name));
	const email = asString(payload.email).toLowerCase();
	const subject = singleLine(asString(payload.subject)) || "Contact form message";
	const message = asString(payload.message);

	if (!name || !email || !message) {
		return json({ error: "Name, email, and message are required." }, 400);
	}
	if (name.length > LIMITS.name) {
		return json({ error: `Name must be ${LIMITS.name} characters or less.` }, 400);
	}
	if (!isValidEmail(email)) {
		return json({ error: "Please provide a valid email address." }, 400);
	}
	if (subject.length > LIMITS.subject) {
		return json({ error: `Subject must be ${LIMITS.subject} characters or less.` }, 400);
	}
	if (message.length < LIMITS.messageMin) {
		return json({ error: `Message must be at least ${LIMITS.messageMin} characters.` }, 400);
	}
	if (message.length > LIMITS.messageMax) {
		return json({ error: `Message must be ${LIMITS.messageMax} characters or less.` }, 400);
	}

	const captcha = await verifyTurnstile(request, env, asString(payload.captchaToken));
	if (!captcha.ok) {
		return json({ error: captcha.error }, captcha.status);
	}

	if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) {
		return json({ error: "The contact form is not configured." }, 503);
	}

	const { text, html } = buildBodies({ name, email, subject, message });

	try {
		await sendEmail(
			{
				to: env.CONTACT_TO_EMAIL || DEFAULT_TO,
				from: env.EMAIL_FROM_CONTACT || DEFAULT_FROM,
				// `from` stays on the verified domain — putting the sender's address
				// there is what gets a domain flagged for spoofing. Their address goes
				// in reply_to so hitting reply in the inbox reaches them.
				replyTo: email,
				subject: `[simonrook.com] ${subject} — ${name}`,
				text,
				html,
			},
			env,
		);
	} catch {
		// Deliberately vague to the browser; the real error is in the Function logs.
		return json({ error: "Could not send your message. Please try again in a moment." }, 502);
	}

	return json({ message: "Thanks — your message has been sent." }, 201);
};

/**
 * One catch-all handler rather than `onRequestPost` — exporting both a
 * method-specific handler and a catch-all in the same module makes which one
 * wins ambiguous, so the method check lives here instead.
 */
export const onRequest: PagesFunction<Env> = async ({ request, env }) =>
	request.method === "POST"
		? handlePost(request, env)
		: json({ error: "Method not allowed." }, 405);
