# Microsoft 365 Group & Outlook Email Delivery Guide

เอกสารคู่มือเชิงลึกสำหรับการแก้ปัญหาการส่งอีเมลเข้า Microsoft 365 (M365) Unified Groups, Distribution Lists และ Outlook Mailbox

---

## 1. สาเหตุหลักที่ทำให้ส่งเข้า Microsoft 365 Group ไม่สำเร็จ

เมื่อส่งอีเมลจากภายนอก (เช่น Gmail SMTP) ไปยังอีเมลกลุ่มของ M365 (เช่น `committee@yourorg.onmicrosoft.com` หรือ `@yourcompany.com`) ปัญหาส่วนใหญ่เกิดจาก 5 ปัจจัยหลักดังนี้:

### สาเหตุที่ 1: การบล็อกผู้ส่งภายนอกตามค่าเริ่มต้น (External Sender Rejection)
* **พฤติกรรม:** M365 Unified Groups และ Distribution Lists ถูกสร้างขึ้นโดยมีค่าเริ่มต้นกำหนดให้ **ปฏิเสธ (Reject)** อีเมลที่ส่งมาจากผู้ส่งภายนอกองค์กร (Non-authenticated senders)
* **รหัสข้อผิดพลาด (NDR):**
  - `550 5.7.133 RESOLVER.RST.SenderNotAuthenticatedForGroup; Authentication required; Delivery restriction check failed because the sender was not authenticated when sending to this group`
  - `550 5.7.1 Transport; Access Denied`

### สาเหตุที่ 2: สมาชิกกลุ่มไม่ได้รับสำเนาเข้า Inbox ส่วนตัว (Group Subscription Behavior)
* **พฤติกรรม:** อีเมลส่งเข้าไปที่ Group Mailbox สำเร็จ (สามารถเปิดดูได้ใน Outlook ผ่านแถบ Groups) แต่สมาชิกแต่ละคน **ไม่ได้รับแจ้งเตือนและไม่มีอีเมลใน Personal Inbox**
* **สาเหตุ:** M365 มีฟังก์ชัน "Follow in Inbox" ซึ่งโดยค่าเริ่มต้นสมาชิกใหม่บางประเภทจะไม่ได้เปิดตัวเลือกนี้ไว้

### สาเหตุที่ 3: Exchange Online Protection (EOP) กรองเป็น Spam หรือ Quarantine
* **พฤติกรรม:** อีเมลถูก EOP ตรวจจับว่ามีคะแนนความเสี่ยงสูง (Spam Confidence Level: SCL 5-9) หรือมี Header ที่ตรงกับเกณฑ์ Bulk/Bot ทำให้อีเมลตกไปอยู่ใน Quarantine หรือ Junk Email
* **ตัวกระตุ้นของ EOP:**
  - Header `Auto-Submitted: auto-generated` หรือ `Auto-Submitted: auto-replied`
  - Header `Precedence: bulk` หรือ `Precedence: list`
  - การส่งจาก Free Mail provider (@gmail.com) โดยมีเนื้อหาเป็นข้อความแจ้งเตือนอัตโนมัติซ้ำๆ ในเวลาสั้นๆ

### สาเหตุที่ 4: SPF / DKIM / DMARC Alignment Failure (Spoofing Detection)
* **พฤติกรรม:** ถ้าส่งผ่าน Gmail SMTP แต่ระบุ `From: user@company.com` โดยที่โดเมนไม่ได้ทำ SPF `include:_spf.google.com` หรือไม่มี DKIM Key ของ Google → M365 DMARC Policy จะ Reject หรือ Quarantine ทันที

### สาเหตุที่ 5: Message Moderation (การรออนุมัติข้อความ)
* **พฤติกรรม:** กลุ่มถูกตั้งค่าเปิด Moderation ไว้ ทำให้ข้อความจากภายนอกต้องรอให้ Group Owner กด Approve ใน Outlook ก่อนจึงจะส่งต่อให้สมาชิก

---

## 2. แนวทางแก้ไขและแนวทางปฏิบัติ (Actionable Solutions)

### วิธีแก้ไขที่ 1: เปิดให้รับผู้ส่งภายนอก (Allow External Senders)

#### ผ่าน Exchange Admin Center (Web UI):
1. เข้าสู่ [Exchange Admin Center](https://admin.exchange.microsoft.com/) ด้วยบัญชีผู้ดูแลระบบ (Admin)
2. ไปที่เมนู **Recipients** → **Groups**
3. ค้นหาและคลิกเลือกกลุ่มที่ต้องการ (เช่น Microsoft 365 Group หรือ Distribution List)
4. ไปที่แท็บ **Settings**
5. ในส่วน **General settings** ให้ติ๊กเลือก:
   - ✅ **"Allow external senders to email this group"** (หรือ "Let people outside the organization email the group")
   - ✅ **"Send copies of group conversations and events to group members"**
6. คลิก **Save**

#### ผ่าน PowerShell (แนะนำสำหรับ Admin):
```powershell
# เชื่อมต่อ Exchange Online
Connect-ExchangeOnline -UserPrincipalName admin@yourdomain.com

# 1. สำหรับ Microsoft 365 Group (Unified Group)
Set-UnifiedGroup -Identity "group-email@yourdomain.com" `
  -RequireSenderAuthenticationEnabled $false `
  -AutoSubscribeNewMembers $true

# 2. สำหรับ Distribution Group (DL แบบดั้งเดิม)
Set-DistributionGroup -Identity "dl-email@yourdomain.com" `
  -RequireSenderAuthenticationEnabled $false

# 3. ตรวจสอบสถานะการตั้งค่า
Get-UnifiedGroup -Identity "group-email@yourdomain.com" | Select-Object DisplayName, RequireSenderAuthenticationEnabled, AutoSubscribeNewMembers
```

---

### วิธีแก้ไขที่ 2: ปรับแต่ง Headers และ Format ของอีเมลให้ผ่านเกณฑ์ EOP

ฝั่ง Application ที่ใช้ Gmail SMTP ต้องปรับแต่ง Header และเนื้อหาดังนี้:

```http
Date: Sat, 15 Aug 2026 08:15:00 +0700
Message-ID: <unique-uuid@smtp.gmail.com>
From: =?UTF-8?B?4Lij4Liw4Lia4Lia4LmB4LiI4LmJ4LiH4LmA4LiV4Li34Lit4LiZ?= <your-account@gmail.com>
To: group-email@yourdomain.com
Subject: =?UTF-8?B?4LmC4LiI4LmJ4LiH4LiB4Liy4Lij4LmB4LiI4LmJ4LiH4LmA4LiV4Li34Lit4LiZ...=?=
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="----=_Part_0_123456789"
```

#### กฎการปรับ Header สำหรับ M365:
1. **ห้ามใส่ `Auto-Submitted` Header:**
   - ห้ามส่ง `Auto-Submitted: auto-generated` เพราะ M365 Group Rules จะระบุว่าเป็น Non-human mail และอาจข้ามการส่งต่อเข้า Inbox ของสมาชิก
2. **ห้ามใส่ `Precedence: bulk`:**
   - ทำให้ M365 จัดเป็นจดหมายขยะหรือโปรโมชัน
3. **ห้ามใส่ `X-Mailer`:**
   - หลีกเลี่ยงการเปิดเผย library ที่ใช้ส่ง เช่น `X-Mailer: nodemailer` หรือ `X-Mailer: python-smtplib`
4. **Envelope From และ Header From ต้องตรงกัน:**
   - ส่งผ่าน SMTP Auth ด้วย `your-account@gmail.com` ส่วน Header `From:` ก็ต้องเป็น `your-account@gmail.com`

---

### วิธีแก้ไขที่ 3: ตั้งค่า Mail Flow Rule ใน Microsoft 365 (Bypass Spam สำหรับระบบภายใน)

หากต้องการให้ M365 ไว้วางใจอีเมลจาก Gmail SMTP ระบบนี้เสมอ ให้ Admin เพิ่ม Mail Flow Rule:

1. ใน EAC ไปที่ **Mail flow** → **Rules**
2. คลิก **Add a rule** → **Create a new rule**
3. ตั้งชื่อ: `Bypass Spam for App Notifications`
4. **Apply this rule if:**
   - Sender is: `your-account@gmail.com`
   - AND Recipient is: `group-email@yourdomain.com`
5. **Do the following:**
   - Set the spam confidence level (SCL) to: **Bypass spam filtering (-1)**
6. คลิก **Save** และเปิดใช้งาน (Enable) Rule
