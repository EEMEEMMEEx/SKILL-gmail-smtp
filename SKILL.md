---
name: gmail-smtp
description: >-
  Diagnose and prevent Gmail SMTP email-delivery, routing, rendering, and
  Microsoft 365/Outlook deliverability failures; use for NDRs, spam or
  quarantine incidents, and safe transactional email delivery.
---

# Gmail SMTP Email Delivery

Use this runbook to isolate application, transport, recipient, rendering, and
Inbox-placement failures. Preserve recipient security; never bypass filtering
or expose credentials to make a test pass.

## 1. Trace the delivery stage first

Capture a sanitized record containing the recipient, UTC timestamp, endpoint,
HTTP status, SMTP response, provider `Message-ID`, envelope sender, header
`From`, and NDR or complete received headers.

- `404`/`5xx` before an SMTP response: inspect the frontend endpoint, API
  contract, dev-server/proxy registration, handler loading, and logs. An
  existing `api/*.js` file is not automatically a local development route.
  Verify `OPTIONS` and a validation-only `POST` (for example, missing `to`
  should return the handler's `400`) before sending a real message.
- `535`/`EAUTH`: check host, port, TLS mode, account policy, and App Password
  validity. Use Gmail implicit TLS on `465` or STARTTLS with TLS required on
  `587`; rotate secrets through the approved store, never print SMTP AUTH data.
- `550 5.1.1`: hard bounce; correct the address and suppress it until fixed.
- `550 5.4.1 Recipient address rejected: Access denied`: likely Microsoft 365
  Directory-Based Edge Blocking (DBEB). Confirm that the exact mailbox/alias
  is provisioned, enabled, and accepted by the recipient tenant; do not retry.
- `550 5.7.133` or group sender-authentication rejection: the M365 Group may
  block external senders. Involve the Exchange admin; do not change policy
  without owner approval.
- Other `550 5.7.x` policy rejections: preserve the complete NDR and ask the
  recipient administrator to identify the rule; do not evade it with retries,
  spoofing, or mail-flow bypass.
- `421`, `451`, or `452`: temporary failure or throttling. Queue retries with
  bounded exponential backoff and a retry limit, then alert.
- SMTP `250` means the relay accepted the handoff, not that the message reached
  Inbox. Check downstream NDRs, recipient trace, Junk, quarantine, mailbox
  rules, and group subscription.

After each smallest corrective change, send one controlled test to a known-valid
mailbox and retain its ID and result.

For transport diagnostics, run a non-production SMTP probe that checks DNS,
TCP reachability, TLS handshake (465 implicit TLS or 587 STARTTLS),
authentication, server response, and message ID without logging secrets.

## 2. Keep composition and routing deterministic

- Pass the selected event/template key and its sample data through preview,
  test-send, and production composition. Build subject, HTML, and text from
  the same input model so the preview cannot differ from the sent event.
- Use one shared renderer with event-specific headings, status, values,
  workflow, and CTA. Escape all user-controlled values, remove unresolved
  template tokens, validate recipients, and preserve CC/BCC intentionally.
- Test every supported event type and assert the request endpoint, non-empty
  `text/plain`, expected HTML markers, escaped content, and absence of unsafe
  markup. Mock the final fetch for composition tests; use a separate controlled
  live test for SMTP and recipient verification.

## 3. Render safely in Gmail and Outlook

- Send `multipart/alternative` with a useful plain-text fallback.
- Use presentational tables, a responsive `width="100%"` outer wrapper, a
  roughly 600-620px content shell, inline CSS, solid colors, readable contrast,
  and a visible fallback URL below the CTA.
- Use HTTPS links on a consistent sender-owned domain; sanitize URLs and avoid
  raw IPs, URL shorteners, scripts, forms, iframes, animations, and hover-only
  interactions. Email clients do not run application UI components reliably.
- Let the mail library generate RFC-compliant `Date`, unique `Message-ID`, MIME
  boundaries, and encoded non-ASCII headers. Keep only purposeful standard
  headers such as `Reply-To` and applicable `Content-Language`; remove
  unnecessary custom `X-*` headers (including `X-Priority` and
  `X-Entity-Ref-ID`), `X-Mailer`, priority, `Auto-Submitted`, bulk, and DSN/
  delivery-status headers unless a documented integration needs them.

## 4. Improve deliverability without weakening security

- Prefer a verified organization-owned sender (for example,
  `no-reply@your-domain`) over a consumer Gmail identity used to represent a
  branded service. Align the visible `From`, envelope/`Return-Path`, and DKIM
  signing domain; publish SPF for the actual sender, enable DKIM, and roll out
  DMARC from monitoring to enforcement after alignment is verified.
- Warm up new sending identities gradually. Deduplicate recipients, suppress
  hard bounces, throttle batches, and monitor bounces, complaints, deferrals,
  quarantine, and Inbox/Junk trends.
- Do not claim an exact Junk cause from a screenshot or HTML success. Retrieve
  the original source and inspect `Authentication-Results`, SPF, DKIM, DMARC,
  `Return-Path`, `From`, `Reply-To`, `Message-ID`, Microsoft anti-spam/SCL
  headers, mailbox rules, and tenant transport rules.
- Treat mailbox "Not junk"/Safe Senders changes as diagnostic feedback, not a
  substitute for domain authentication or sender reputation.

## 5. Zero-credential exposure

Never put passwords, temporary passwords, App Passwords, API keys, recovery
codes, or reusable tokens in email bodies, URLs, logs, screenshots, or tickets.
For invitations, send only identity/role and a link to the official app; use a
short-lived, single-use, logged activation, password-reset, or magic-link flow.
Keep SMTP configuration server-side with least-privilege secret access. A
browser calls the intended absolute backend API; it never sends SMTP directly.
Rotate a credential after suspected exposure or anomalous authentication, test
the replacement once, then revoke the old credential.

## 6. Close the incident

Record the failure stage, sanitized evidence, root cause versus hypothesis,
change made, one end-to-end success, and the responsible tenant-owner handoff.
Leave sender-domain, M365-policy, mail-flow bypass, and reputation changes in
an approved change process with scope, review date, and rollback plan.
