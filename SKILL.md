---
name: gmail-smtp
description: >-
  Configure and troubleshoot Gmail SMTP delivery to consumer and Microsoft 365 inboxes.
  Use for SMTP acceptance, NDRs, M365/Exchange rejections, spam or quarantine incidents,
  and safe transactional-email delivery; not for sending credentials or bypassing mail security.
---

# Gmail SMTP & Enterprise Email Delivery

Use this runbook to diagnose transactional-email delivery without weakening recipient security.
Keep SMTP credentials server-side, redact them from logs and tickets, and never place passwords or other credentials in email content.

## Triage: establish where delivery failed

1. Capture the recipient, UTC timestamp, SMTP response, provider message ID, envelope sender, header `From`, and any NDR or full received headers. Redact secrets and personal data.
2. Test the transport separately: DNS/network reachability, TLS negotiation, and SMTP authentication. For Gmail SMTP, use implicit TLS on port 465 or STARTTLS with TLS required on port 587; use an App Password or another supported authentication method, never an account password.
3. Treat `250 2.0.0 Accepted for delivery` as **handoff to the relay, not proof of inbox delivery**. Check for a downstream NDR, recipient-side trace, Junk, and admin quarantine before changing the sender.
4. Classify the failure, apply the smallest corrective action, then send one controlled test to a known-valid mailbox. Preserve the message ID and result as evidence.

| Signal | Likely cause | Action |
|---|---|---|
| `550 5.4.1 Recipient address rejected: Access denied` from M365/EOP | Directory-Based Edge Blocking (DBEB): recipient is absent, disabled, or not an accepted address in Microsoft Entra ID | Verify the exact mailbox/alias with the recipient organization. Correct the address or have an admin provision/enable it; do not retry repeatedly. |
| `550 5.1.1` / hard bounce | Mailbox does not exist | Suppress the address until corrected. |
| `550 5.7.133` or group sender-not-authenticated error | M365 Group blocks external senders | Ask the Exchange admin to confirm whether external senders are intended and change the group only with approval. |
| `421`, `451`, or `452` | Temporary throttling or service failure | Queue and retry with bounded exponential backoff; stop at the configured retry limit and alert. |
| `535`, `EAUTH`, or authentication failure | Wrong/revoked App Password, 2-Step Verification or SMTP auth policy | Validate non-secret configuration and rotate the credential through the approved secret store. |
| Accepted but missing from Inbox/Junk | Quarantine, content/header reputation, or group subscription | Inspect the recipient tenant’s message trace/quarantine and the received headers before changing content. |

## Deliverability and header hygiene

- Align the SMTP-authenticated envelope sender and header `From` with an identity authorized to send for that domain. Verify SPF, DKIM, and DMARC alignment; do not spoof another domain in `From`.
- Let the mail library generate RFC-compliant `Date`, unique `Message-ID`, MIME boundaries, and encoded non-ASCII display names/subjects. Use `multipart/alternative` with both plain-text and HTML versions.
- Add only purposeful standard metadata such as `Reply-To` and, when applicable, `Content-Language`. Avoid nonessential custom `X-` headers, `X-Mailer`, priority tags, `Auto-Submitted: auto-generated`, `Precedence: bulk`, and delivery-status requests unless a documented integration requires them. These can trigger enterprise heuristics or alter group handling.
- Make HTML email conservative: table layout, inline CSS, readable text fallback, no scripts/forms/iframes, and a clear sender identity. Every link must be HTTPS, point to the stated destination, and avoid raw IPs and URL shorteners.
- Keep sending behavior predictable: validate and deduplicate recipients, suppress hard bounces, throttle batches, warm up new senders, and monitor bounce, complaint, deferral, and quarantine trends.

## Zero-Credential Exposure

Transactional email must never contain a password, temporary password, App Password, API key, recovery code, or secret copied from another channel. Do not send reusable authentication tokens. An external sender combined with a password and sign-in link is commonly classified by enterprise filters as credential-harvesting phishing and may be quarantined without appearing in Junk.

For invitations, send only the account identity and role plus a link to the official application. Use an approved identity-provider activation, password-reset, or magic-link flow that is short-lived, single-use, and logged. Do not include the token itself in diagnostic logs or support tickets.

## Microsoft 365 and group delivery

- Before sending an invitation or critical notification, confirm the recipient address is provisioned and active in Microsoft 365/Google Workspace. M365 validates recipients at the edge; an address-shaped string is not enough.
- For a M365 Group, distinguish “message reached the group mailbox” from “members received personal inbox copies.” The Exchange admin can review external-sender and subscription settings.
- Never enable external senders, create mail-flow bypass rules, or lower spam/phishing protection merely to make a test pass. These are recipient-tenant policy changes and require the responsible M365 administrator’s explicit approval, narrow scope, review date, and rollback plan.

## Secure service operation

- Send mail from a backend/serverless dispatcher, never from a browser. Static frontends must call the intended absolute API endpoint; a relative endpoint can fail and fall back to an unrelated auth-email flow.
- Keep SMTP configuration in approved secret management with least-privilege read access. Never hardcode credentials, return them from APIs, expose them to the client, or print SMTP AUTH transcripts.
- Rotate a credential after suspected exposure or failed-auth anomalies. Test the new credential with a controlled recipient, then revoke the old one.

## Close the incident

Record the failure class, sanitized evidence, corrective action, one successful end-to-end test, and any tenant-owner handoff. If a sender-domain, M365-policy, or reputation change is needed, stop after collecting evidence and obtain the owner’s approval rather than bypassing controls.

Read `references/gmail-smtp-config.md` for connection details and SMTP codes; `references/m365-group-delivery.md` for Exchange group administration; and `references/anti-spam-deliverability.md` for sender-authentication and template details.
