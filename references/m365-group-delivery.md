# Microsoft 365 Enterprise & Corporate Inbox Delivery Guide (Exchange Online Protection & Defender)

เอกสารคู่มือเชิงลึกสำหรับการแก้ปัญหาการส่งอีเมลเข้า Microsoft 365 (M365) Corporate Inboxes (เช่น `@forth.co.th`), Unified Groups, Distribution Lists และการรับมือกับระบบความปลอดภัย Microsoft Defender for Office 365

---

## 1. สาเหตุหลักที่ทำให้ส่งเข้า Microsoft 365 / Corporate Inboxes ไม่สำเร็จ

เมื่อส่งอีเมลจาก Gmail SMTP (`@gmail.com` หรือ Custom Domain) ไปยังอีเมลองค์กร ปัญหาส่วนใหญ่เกิดจาก 6 ปัจจัยหลักดังนี้:

### สาเหตุที่ 1: Microsoft Defender High-Confidence Phishing Quarantining (สาเหตุสำคัญที่สุด)
* **พฤติกรรม:** อีเมลส่งออกจาก Gmail SMTP สำเร็จ (ขึ้นใน Gmail Sent) แต่ **ไม่ปรากฏใน Inbox หรือ Junk ของผู้รับใน Outlook** เลย
* **กลไกการทำงานของ Defender:**
  - เมื่อผู้ส่งเป็น Free Email หรือ Third-party SMTP (`@gmail.com`) ส่งเข้าสู่โดเมนองค์กร
  - **หากตรวจพบข้อความระบุรหัสผ่าน (Password)** เช่น `รหัสผ่านตั้งต้น (Initial Access)`, `รหัสผ่านชั่วคราว: F0rth2026@...` พร้อมกับลิงก์เข้าสู่ระบบ (`Log in / Sign in`) ที่ชี้ไปยังโดเมนภายนอก (`github.io`, `vercel.app`)
  - Defender จะตีตราอีเมลฉบับนั้นเป็น **High-Confidence Phishing (Spam Confidence Level: SCL 9)**
  - นโยบายความปลอดภัยของ Microsoft 365 สำหรับ Phishing คือการนำเข้า **Admin Quarantine โดยตรง** ทำให้ผู้รับไม่เห็นอีเมลแม้แต่ใน Junk Mail!
* **แนวทางแก้ไข:** ถอดการส่งรหัสผ่านในเนื้อหาอีเมลออกทั้งหมด เปลี่ยนเป็น **Clean Administrative Notification** แจ้งข้อมูลบัญชีและปุ่มเข้าใช้งานเท่านั้น

### สาเหตุที่ 2: Custom Headers ที่กระตุ้น Bot Anomaly Heuristics
* **พฤติกรรม:** การใส่ Header ที่ไม่ได้มาตรฐาน เช่น `X-Priority: 3`, `X-Entity-Ref-ID: <uuid>`, หรือ `X-Mailer: <script>`
* **ผลกระทบ:** EOP สแกนพบความผิดปกติของ Header ที่สร้างโดย Script อัตโนมัติ ทำให้คะแนน Spam Score เพิ่มขึ้น
* **แนวทางแก้ไข:** ถอด `X-` headers ทั้งหมดออก ใช้เฉพาะมาตรฐาน RFC: `Date`, `From`, `To`, `Subject`, `Message-ID`, `Content-Language: th`, `Reply-To`

### สาเหตุที่ 3: การบล็อกผู้ส่งภายนอกของ M365 Group (External Sender Rejection)
* **พฤติกรรม:** ส่งเข้า Distribution List หรือ Microsoft 365 Group แล้วได้รับ NDR ตีกลับ `550 5.7.133 RESOLVER.RST.SenderNotAuthenticatedForGroup`
* **แนวทางแก้ไข:** สั่งเปิดรับผู้ส่งภายนอกผ่าน Exchange Admin Center หรือ PowerShell (`Set-UnifiedGroup -RequireSenderAuthenticationEnabled $false`)

### สาเหตุที่ 4: สมาชิกกลุ่มไม่ได้รับสำเนาเข้า Inbox ส่วนตัว (Group Subscription Behavior)
* **พฤติกรรม:** อีเมลเข้า Group Mailbox แต่ไม่เด้งเข้า Personal Inbox ของสมาชิก
* **แนวทางแก้ไข:** สั่ง `Set-UnifiedGroup -AutoSubscribeNewMembers $true`

### สาเหตุที่ 5: SPF / DKIM / DMARC Alignment Failure
* **พฤติกรรม:** ส่งผ่าน Gmail SMTP แต่ปลอม Header `From:` เป็นโดเมนอื่นที่ไม่ได้ลงทะเบียน SPF กับ Google ทำให้ DMARC Fail

### สาเหตุที่ 6: Frontend API Endpoint 404 & Silent Auth Fallback
* **พฤติกรรม:** Frontend บน GitHub Pages เรียก Relative URL `/api/send-email` (404) ทำให้ Client Fallback ไปเรียก Supabase Auth ซึ่งส่งอีเมลภาษาอังกฤษ "Reset your password" ออกมาแทน

---

## 2. แนวทางปฏิบัติสำหรับระบบอีเมลระดับ Enterprise (Actionable Runbook)

### กฎข้อที่ 1: การออกแบบ Template แบบ Zero-Credential Exposure
```html
<!-- ปลอดภัย 100% ผ่านตัวกรอง Defender / EOP -->
<table role="presentation" width="100%" style="max-width:600px; background-color:#ffffff; font-family:'Sarabun', 'Noto Sans Thai', Arial, sans-serif;">
  <tr><td style="padding:24px;">
    <h2>แจ้งข้อมูลบัญชีผู้ใช้งานระบบ StockFlow</h2>
    <p>เรียน คุณ สมชาย ใจดี,</p>
    <p>ผู้ดูแลระบบได้สร้างและเปิดสิทธิ์การใช้งานสำหรับคุณเรียบร้อยแล้ว</p>
    <table style="background-color:#f8fafc; border:1px solid #e2e8f0; width:100%; padding:12px;">
      <tr><td>ชื่อ-สกุล:</td><td>สมชาย ใจดี</td></tr>
      <tr><td>อีเมล:</td><td>somchai@forth.co.th</td></tr>
      <tr><td>บทบาท:</td><td>Operator</td></tr>
    </table>
    <div style="text-align:center; margin-top:20px;">
      <a href="https://stock-flow.vercel.app" style="background-color:#2563eb; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px;">เข้าสู่ระบบ</a>
    </div>
  </td></tr>
</table>
```

### กฎข้อที่ 2: มาตรฐาน Header สำหรับ Microsoft 365
```http
Date: Mon, 17 Aug 2026 20:30:00 +0700
Message-ID: <uuid@smtp.gmail.com>
From: "StockFlow Notification" <stockflow.noreply.app@gmail.com>
To: recipient@forth.co.th
Subject: =?UTF-8?B?...?=
Reply-To: stockflow.noreply.app@gmail.com
Content-Language: th
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="----=_Part_..."
```

---

## 3. PowerShell Commands สำหรับ M365 Admin

```powershell
# เชื่อมต่อ Exchange Online
Connect-ExchangeOnline -UserPrincipalName admin@yourdomain.com

# 1. สำหรับ Microsoft 365 Group (Unified Group)
Set-UnifiedGroup -Identity "group-email@yourdomain.com" `
  -RequireSenderAuthenticationEnabled $false `
  -AutoSubscribeNewMembers $true

# 2. สำหรับ Distribution Group (DL)
Set-DistributionGroup -Identity "dl-email@yourdomain.com" `
  -RequireSenderAuthenticationEnabled $false

# 3. ตรวจสอบสถานะการตั้งค่า
Get-UnifiedGroup -Identity "group-email@yourdomain.com" | Select-Object DisplayName, RequireSenderAuthenticationEnabled, AutoSubscribeNewMembers
```

---

## 4. Mail Flow Rule ใน Microsoft 365 (Bypass Spam สำหรับระบบภายใน)

หากต้องการให้ M365 ไว้วางใจอีเมลจากระบบแจ้งเตือนเสมอ:
1. ใน EAC ไปที่ **Mail flow** → **Rules** → **Add a rule**
2. ตั้งชื่อ: `Bypass Spam for App Notifications`
3. **Apply this rule if:** Sender is `stockflow.noreply.app@gmail.com`
4. **Do the following:** Set the spam confidence level (SCL) to: **Bypass spam filtering (-1)**
5. คลิก **Save** และเปิดใช้งาน (Enable) Rule

