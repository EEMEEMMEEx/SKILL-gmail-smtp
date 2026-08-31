---
name: gmail-smtp
description: >-
  Diagnose, fix, and prevent Gmail SMTP email-delivery, API gateway routing,
  HTML/NLP rendering, and Microsoft 365/Defender deliverability failures; use for
  NDRs, silent drops/quarantine incidents, and secure transactional email delivery.
---

# Gmail SMTP & Enterprise Email Delivery Runbook

Use this runbook to isolate application API gateways, event dispatchers, SMTP transport, recipient directories, HTML/NLP content filtering, and Inbox placement failures. Preserve security; never bypass filtering or expose credentials.

## 1. Isolate the Failure Tier in the Delivery Pipeline

Trace the failure domain across the end-to-end pipeline before applying changes:
`UI Trigger -> Event Dispatcher -> Payload Assembler / Renderer -> Dev Proxy / API Gateway -> Gmail SMTP (465/587) -> M365 EOP / Defender -> Recipient Inbox`

Capture a sanitized diagnostic record: UTC timestamp, recipient, event type, endpoint, HTTP status, SMTP response code, provider `Message-ID`, envelope sender (`Return-Path`), and header `From`.

- **Client / API Gateway (`404` / `5xx` / CORS before SMTP):**
  - Verify local dev proxy or middleware (e.g. Vite SPA serving `index.html` fallback for unmapped `/api/*` serverless routes).
  - An `api/*.js` file is not automatically an active route in local frontend development without an explicit dev proxy or running backend.
  - Verify endpoints using an `OPTIONS` probe and a validation-only `POST` (missing payload must return `400 Bad Request`, not `200 text/html` or `404`).
- **Event Wiring & Dispatcher Omission:**
  - Verify that UI actions or DB RPC calls actually invoke the notification dispatcher.
  - Dynamically resolve recipient roles (e.g., query `ADMIN`/`SUPERVISOR` from user profiles) rather than hardcoding addresses.
  - Implement in-memory / cache deduplication to prevent duplicate emails from rapid double-clicks or race conditions.
- **SMTP Transport & Authentication (`535` / `EAUTH` / Connection):**
  - Use `smtp.gmail.com:465` (implicit TLS) or `587` (STARTTLS with `requireTLS: true`).
  - Verify Google App Password validity; manage secrets strictly server-side.
- **Recipient & Downstream Policy Bounces:**
  - `550 5.1.1`: Hard bounce (invalid address); suppress immediately, do not retry.
  - `550 5.4.1 Recipient address rejected: Access denied`: Microsoft 365 Directory-Based Edge Blocking (DBEB). Mailbox/alias does not exist or is inactive in Entra ID / Exchange; verify recipient existence with tenant admin.
  - `550 5.7.133`: M365 Group rejects external senders; requires Exchange admin policy approval.
  - `550 5.7.x`: Policy rejections; preserve full NDR and consult tenant admin.
  - `421`, `451`, `452`: Temporary throttle/deferral; queue retries with bounded exponential backoff.
- **The "Silent Drop" / Quarantine Trap (SMTP `250 2.0.0 OK` ≠ Inbox Delivery):**
  - SMTP `250` only proves the relay accepted the message, not that it reached the Inbox.
  - If missing in Focused Inbox: inspect Junk folder, quarantine portal, Exchange message trace, and anti-spam headers (`Authentication-Results`, `X-Forefront-Antispam-Report`, `SCL`).

## 2. Anti-Spam NLP, Content Hygiene & Phishing Lure Prevention

Microsoft 365 Defender and modern spam filters use heuristic NLP and visual pattern matching. Prevent false-positive spam/quarantine classification:

- **Eliminate Alarmist / Urgency Triggers:**
  - Avoid high-risk urgency words in Subject and Body (e.g., *"เตือนภัย:"*, *"ด่วนที่สุด"*, *"ถูกปฏิเสธทันที"*, *"Action Required Immediately"*).
  - Use neutral, professional operational terminology (e.g., *"แจ้งเตือนรายการพัสดุถึงจุดสั่งซื้อ (Reorder Point Alert)"*, *"คำขอเบิก {{request_no}} ไม่ได้รับการอนุมัติ — {{project_name}}"*).
- **Avoid Phishing Lure Visual Patterns:**
  - Do NOT pair rejection/alert wording with high-contrast deep red alert boxes (`#b91c1c` on `#fff1f2`) and external action CTA buttons. Threat filters flag this as counterfeit account-suspension / banking phishing.
  - Use subdued amber/neutral notice styles (`#9a3412` text, `#fff7ed` background, `#fed7aa` border).
- **Preheader & Hidden Text Integrity:**
  - Ensure hidden preview preheaders (`display:none; max-height:0px; overflow:hidden`) contain fully resolved, clean contextual text.
  - Unresolved template tokens or large whitespace gaps in hidden text mimic zero-font spam injection and elevate Spam Confidence Level (SCL).
- **RFC Header Hygiene & Envelope Alignment:**
  - Align envelope sender (`Return-Path`) with the authenticated SMTP identity.
  - Mail libraries must generate RFC-compliant `Date`, unique `Message-ID`, and RFC 2047 encoded non-ASCII headers.
  - Include standard headers: `MIME-Version: 1.0`, `Content-Language: th` (or target locale), `Reply-To`, `Auto-Submitted: auto-generated`, `X-Priority: 3` (Normal).
  - Strip high-risk/unnecessary headers: `X-Mailer`, `Precedence: bulk`, `X-Priority: 1` (High), `X-Entity-Ref-ID`, and unsolicited DSN headers.

## 3. Unified Rendering Architecture & Template State Consistency

- **Single Shared Master Layout:**
  - Render all transactional notifications, alerts, diagnostics, and invitations through one shared responsive HTML engine (`emailRenderer.js`).
  - Structure: Responsive table-based layout (`width="100%"`, max-width `600–620px`), inline CSS styles, solid color contrasts, Outlook VML table fallbacks, and a visible fallback URL below CTA buttons.
  - Dynamic contextual tables: Adapt table column headers to the event (e.g., *"รายการวัสดุที่ขอเบิก"*, *"รายการวัสดุที่รับเข้า"*, *"รายการวัสดุที่ต้องเติมสต็อก"*).
  - Always send `multipart/alternative` with an informative, non-empty `text/plain` counterpart.
- **Database Template Overrides & Auto-Upgrade:**
  - When email templates are stored in a database (e.g., Supabase config), stale database records can override code-level fixes with legacy spam-trigger copy.
  - Implement schema merging with auto-upgrade logic (`mergeEventsWithDefaults`) to detect and migrate legacy strings.
  - Provide admin UI controls ("Reset to Default" / "Reset All") to instantly re-align stored templates with clean codebase standards.
- **Input Sanitization & Link Safety:**
  - HTML-escape all dynamic variables (`escapeHtml`) to prevent markup breakage and XSS.
  - Use HTTPS links on consistent, sender-owned domains. Avoid raw IP addresses, URL shorteners, forms, scripts, and iframes.

## 4. Deliverability, Domain Authentication & M365 Policies

- **Domain Authentication Alignment:**
  - Configure SPF, DKIM, and DMARC alignment for the sending domain. Consumer Gmail identities representing branded domains carry deliverability penalties on enterprise gateways.
  - Warm up new sending identities gradually; suppress hard bounces immediately to protect sender IP reputation.
- **Diagnosing Filter Actions from Raw Headers:**
  - Inspect `Authentication-Results` for `spf=pass`, `dkim=pass`, `dmarc=pass`.
  - Check `X-Forefront-Antispam-Report` for `SCL` (Spam Confidence Level): `0–1` = Legitimate (Inbox), `5–6` = Spam (Junk), `9` = High-Confidence Phishing (Quarantine).
  - Never disable tenant filters or create wide whitelist rules to bypass delivery failures during development. Address the root cause in domain auth or content hygiene.

## 5. Zero-Credential Exposure Policy

- **Strict Secret Isolation:**
  - Never put passwords, temporary credentials, App Passwords, API keys, recovery codes, or reusable tokens in email bodies, subjects, URLs, dev logs, or client-side bundles.
  - External transactional emails containing plaintext passwords alongside login links trigger High-Confidence Phishing (SCL 9) and are quarantined without reaching Junk.
- **Secure Onboarding / Invitation Flow:**
  - Invitation emails must contain only user identity/role and a link to the official application.
  - Credential provisioning must use short-lived, single-use, auditable identity-provider activation, password-reset, or magic-link flows.

## 6. Automated Verification & Incident Closure Checklist

Before closing any email delivery issue or releasing code changes:

1. **Automated Unit Tests:** Run test suites (e.g., `npm run test:email`) to assert:
   - All supported notification types render with the shared layout.
   - Dynamic template variables resolve with zero unresolved `{{tokens}}`.
   - User inputs are sanitized/escaped against XSS.
   - Both HTML and clean plain-text fallbacks are generated.
   - Zero-credential policy is enforced (no passwords/tokens rendered).
2. **Production Build:** Validate bundle compilation (`npx vite build` or equivalent).
3. **Controlled Live Delivery Test:**
   - Send one controlled test message to a monitored target mailbox.
   - Track provider `Message-ID` and verify physical arrival in **Focused Inbox**.
4. **Documentation & Handoff:**
   - Record failure stage, sanitized evidence, root cause vs hypothesis, code changes, and verification proof.
   - Hand off any tenant-level DNS or Exchange policy changes to authorized domain administrators.

