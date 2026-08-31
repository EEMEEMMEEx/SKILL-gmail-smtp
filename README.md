# Gmail SMTP & Enterprise Email Deliverability

คู่มือและเครื่องมือสำหรับส่งอีเมลธุรกรรมผ่าน Gmail SMTP ไปยัง Gmail, Microsoft 365 และกล่องจดหมายองค์กร พร้อมแนวทางวินิจฉัย NDR, Spam/Quarantine, Header Hygiene และ Zero-Credential Exposure

> **ขอบเขตความปลอดภัย:** เอกสารนี้ไม่รับรอง Inbox placement 100% และไม่แนะนำให้ปิดตัวกรองหรือสร้าง bypass rule เพื่อให้การทดสอบผ่าน การเปลี่ยน policy ของ Microsoft 365 ต้องให้ Exchange Administrator อนุมัติอย่างชัดเจน

## เริ่มต้นอย่างรวดเร็ว

1. เปิด 2-Step Verification และสร้าง [Google App Password](https://myaccount.google.com/apppasswords) สำหรับบัญชีผู้ส่ง ใช้ App Password เท่านั้น ไม่ใช้รหัสผ่านบัญชีจริง
2. ตั้งค่า SMTP ใน secret manager หรือ environment ของ backend (ห้าม commit ค่าเหล่านี้):

   ```ini
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=sender@gmail.com
   SMTP_PASS=<16-character-app-password>
   ```

3. ใช้ `smtp.gmail.com:465` สำหรับ implicit TLS หรือ port `587` พร้อม STARTTLS ที่บังคับใช้ TLS
4. ทดลองส่งจาก [ตัวอย่าง Native TLS](./examples/smtp-send-example.js):

   ```bash
   node examples/smtp-send-example.js
   ```

ตัวอย่างจะสร้าง `multipart/alternative`, RFC 2047 headers และ `Message-ID` ใหม่ต่อฉบับ อย่าใส่ credential จริงใน source, terminal transcript หรือ issue tracker

## สถาปัตยกรรมที่แนะนำ

```text
Frontend / Static site
        │ HTTPS (absolute API URL)
        ▼
Backend or Serverless Dispatcher
  ├─ reads SMTP config/secret server-side
  ├─ renders clean, zero-credential content
  └─ records sanitized provider message ID
        │ SMTPS 465 or STARTTLS 587
        ▼
Gmail SMTP ── downstream delivery ──► Gmail / M365 EOP / corporate inbox
```

Static frontend ต้องเรียก endpoint ของ dispatcher แบบ absolute URL; relative `/api/send-email` บน static hosting อาจได้ `404` และตกไปใช้ auth-email fallback ที่ไม่เกี่ยวข้อง

## Troubleshooting: แยกจุดที่ล้มเหลว

`250 2.0.0 Accepted for delivery` หมายถึง Gmail รับเข้าคิวเท่านั้น ไม่ใช่หลักฐานว่าเข้า Inbox แล้ว ให้เก็บเวลา, ผู้รับ, envelope/header `From`, provider message ID, SMTP response, NDR และ received headers โดยลบข้อมูลลับก่อนแชร์

| สัญญาณ | สาเหตุที่พบบ่อย | การดำเนินการ |
|---|---|---|
| `550 5.4.1 Recipient address rejected: Access denied` จาก M365/EOP | DBEB ไม่พบผู้รับ, ผู้รับถูกปิด หรือไม่ใช่ alias ที่รับได้ | ตรวจสอบ mailbox/alias ที่มีอยู่จริงใน Entra ID กับผู้ดูแลปลายทาง แก้ address หรือ provision ก่อนส่งใหม่ |
| `550 5.1.1` | Hard bounce: mailbox ไม่มีอยู่ | suppress address จนกว่าจะแก้ไข ห้าม retry ซ้ำ |
| `550 5.7.133` | M365 Group ไม่รับ external sender | ให้ Exchange Admin ตรวจสอบความจำเป็นและเปลี่ยน setting เฉพาะเมื่อได้รับอนุมัติ |
| `421`, `451`, `452` | throttle หรือปัญหาชั่วคราว | queue + bounded exponential backoff และหยุดเมื่อครบ retry limit |
| `535` หรือ `EAUTH` | App Password ผิด/ถูก revoke หรือ policy ไม่อนุญาต SMTP auth | ตรวจเฉพาะค่าที่ไม่ลับ หมุน credential ผ่าน secret store และทดสอบกับผู้รับควบคุม |
| Accepted แต่ไม่พบใน Inbox/Junk | Quarantine, reputation, content/header หรือ group subscription | ตรวจ message trace/quarantine และ received headers กับผู้ดูแล tenant |

## กฎ Deliverability ที่ต้องรักษา

- Envelope sender และ header `From` ต้องเป็น identity ที่ authenticate และได้รับอนุญาตให้ส่ง ตรวจ SPF, DKIM และ DMARC alignment
- ให้ mail library สร้าง `Date`, unique `Message-ID`, MIME boundary และ RFC 2047 encoding; ใช้ `multipart/alternative` ที่มีทั้ง `text/plain` และ `text/html`
- ใช้เฉพาะ metadata ที่จำเป็น เช่น `Reply-To`, `Content-Language: th`, `MIME-Version: 1.0`; หลีกเลี่ยง custom `X-*`, `X-Mailer`, `X-Priority`, `X-Entity-Ref-ID`, `Auto-Submitted: auto-generated`, `Precedence: bulk` และ DSN ที่ไม่จำเป็น
- HTML ใช้ table layout + inline CSS, ไม่มี script/form/iframe; ทุกลิงก์เป็น HTTPS และปลายทางต้องตรงกับข้อความ ห้าม raw IP และ URL shortener
- validate/deduplicate ผู้รับ, suppress hard bounce, throttle และ warm up sender ใหม่; ติดตาม bounce, complaint, deferral และ quarantine

## Zero-Credential Exposure

ห้ามส่ง password, temporary password, App Password, API key, recovery code หรือ reusable authentication token ในอีเมล การส่ง password คู่กับ sign-in link จาก external sender อาจถูก Defender จัดเป็น High-Confidence Phishing (SCL 9) และกักกันโดยไม่แสดงใน Junk

Invitation ควรมีเพียง identity/role และลิงก์ไปยังแอปทางการ หากต้องตั้งรหัสผ่าน ให้ใช้ identity-provider activation, password-reset หรือ single-use magic link ที่หมดอายุและ audit ได้ ห้ามใส่ token ใน log หรือ ticket

## Microsoft 365 และ Group delivery

- ตรวจสอบว่าผู้รับถูกสร้างและ active ใน Microsoft 365/Google Workspace ก่อนส่ง อีเมลที่มีรูปแบบถูกต้องไม่ได้แปลว่ามี mailbox จริง
- แยก “เข้า Group mailbox” ออกจาก “กระจายเข้า Inbox สมาชิก” โดยตรวจ external-sender และ subscription settings กับ Exchange Admin
- ห้ามเปิด external senders, ตั้ง SCL bypass หรือ ลดการป้องกัน phishing เพื่อแก้การทดสอบชั่วคราว หากจำเป็นต้องเปลี่ยน policy ต้องมี owner, ขอบเขตแคบ, วันทบทวน และ rollback plan

## Interactive tools

เปิด [`landing-page/index.html`](./landing-page/index.html) เพื่อใช้เครื่องมือแบบ zero-build:

- RFC 2047 Thai header encoder
- SMTP/Deliverability checklist และ response-code lookup
- Zero-Credential template preview
- M365 troubleshooting และ PowerShell command generator (ตรวจสอบและอนุมัติก่อนนำไปใช้จริง)

## ไฟล์สำคัญและเอกสารอ้างอิง

- [`SKILL.md`](./SKILL.md) — runbook หลักสำหรับ AI และผู้ปฏิบัติงาน
- [`email-delivery-incident-root-cause-analysis.md`](./email-delivery-incident-root-cause-analysis.md) — RCA, Header Hygiene, Zero-Credential Exposure และหลักฐานการแก้ไข
- [`examples/smtp-send-example.js`](./examples/smtp-send-example.js) — Native TLS SMTP reference implementation
- [`references/gmail-smtp-config.md`](./references/gmail-smtp-config.md) — ports, TLS, limits และ SMTP response codes
- [`references/m365-group-delivery.md`](./references/m365-group-delivery.md) — EOP/Defender และ group delivery
- [`references/anti-spam-deliverability.md`](./references/anti-spam-deliverability.md) — SPF/DKIM/DMARC, MIME และ content hygiene

## โครงสร้างโปรเจกต์

```text
SKILL.md                         # reusable troubleshooting runbook
README.md                        # project guide
index.html                       # root entry, forwards to Landing Page
landing-page/                    # all Landing Page files
  index.html / app.js / styles.css
  components/ / assets/
examples/                        # reference sender
references/                      # detailed protocol and provider guides
```

## License

MIT © 2026 Internal Skill Configuration & Runbook
