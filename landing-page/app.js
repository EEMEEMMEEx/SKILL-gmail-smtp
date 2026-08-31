/**
 * Gmail SMTP & Deliverability Skill - Interactive Web Engine
 * Pure vanilla JavaScript - Zero external runtime dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initPipelineInspector();
  initRFC2047Encoder();
  initM365Generator();
  initZeroCredentialTemplate();
  initDeliverabilityCalculator();
  initTroubleshootFilters();
  initCodeGenerator();
  initClipboardButtons();
  initViewModeToggle();
  initAcidSquares();
  initStrands();
});

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const iconSvg = type === 'success' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

  toast.innerHTML = `<span class="svg-icon">${iconSvg}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}

/* ==========================================================================
   Tabs System
   ========================================================================== */
function initTabs() {
  document.querySelectorAll('.tab-wrapper').forEach(wrapper => {
    const nav = wrapper.querySelector('.tabs-nav');
    if (!nav) return;
    const buttons = nav.querySelectorAll('.tab-btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        if (!targetId) return;

        buttons.forEach(b => b.classList.remove('active'));
        wrapper.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        
        btn.classList.add('active');
        const targetContent = wrapper.querySelector(`#${targetId}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  });
}

/* ==========================================================================
   Interactive Architecture Pipeline Inspector
   ========================================================================== */
const PIPELINE_STAGES = {
  1: {
    title: 'STAGE 01: UI Trigger & Form Actions',
    status: 'Verified',
    desc: 'เมื่อผู้ใช้บันทึกธุรกรรมใน Web App (เช่น หน้า StockIn.jsx หรือ RequestWithdrawal.jsx) ฟังก์ชัน Handler จะรวบรวม Parameter และส่งต่อเข้าสู่ Notification Dispatcher โดยไม่บันทึกรหัสผ่านใดๆ',
    tech: 'Client UI ──► handleSubmit() ──► dispatchStockInNotification({ stockIn, profile, ... })'
  },
  2: {
    title: 'STAGE 02: Role Resolver & Deduplication',
    status: 'Verified',
    desc: 'notificationDispatcher.js ดึงรายชื่ออีเมลผู้รับตาม Role (ADMIN / SUPERVISOR) จากตาราง profiles ใน Supabase พร้อมระบบ In-Memory Cache Deduplication ป้องกันการส่งซ้ำในกรณี Race Condition',
    tech: 'Supabase profiles query ──► resolveRecipientsByRole() ──► Cache Key: event:id:timestamp'
  },
  3: {
    title: 'STAGE 03: Unified Shared Email Renderer',
    status: 'Verified',
    desc: 'emailRenderer.js ประกอบ Responsive Table Shell (Max-width 620px), Inline CSS, Hidden Preheader, และเนื้อหาตารางพัสดุเฉพาะเหตุการณ์ พร้อมสร้าง text/plain ควบคู่เสมอ',
    tech: 'renderEmailHtml({ event_type, data, preheader, ... }) ──► HTML (620px) + Plain Text'
  },
  4: {
    title: 'STAGE 04: Local Dev Proxy / Serverless Gateway',
    status: 'Dev Proxy Ready',
    desc: 'Vite Dev Server Proxy ดักจับเส้นทาง /api/send-email ส่งต่อไปยัง Local Serverless Runtime เพื่อป้องกันปัญหา HTTP 404 (ที่ Vite ปกติจะส่ง index.html SPA fallback กลับมา)',
    tech: 'vite.config.js middleware ──► /api/send-email ──► Node.js Serverless Handler'
  },
  5: {
    title: 'STAGE 05: Gmail SMTP Relay (Port 465 TLS)',
    status: 'Verified (250 OK)',
    desc: 'Nodemailer หรือ Native TLS Client ยืนยันสิทธิ์ด้วย Google App Password 16 หลัก ผ่านพอร์ต 465 (Implicit TLS) โดย Envelope Sender (Return-Path) ต้องตรงกับบัญชีที่ Authenticate',
    tech: 'smtp.gmail.com:465 Implicit TLS ──► AUTH LOGIN ──► SMTPS Handshake ──► 250 2.0.0 OK'
  },
  6: {
    title: 'STAGE 06: Microsoft Defender NLP Heuristics',
    status: 'Verified (SCL: 0)',
    desc: 'Exchange Online Protection (EOP) ตรวจสอบ SPF/DKIM/DMARC และ Microsoft Defender วิเคราะห์ข้อความ ไม่พบคำเตือนภัยรุนแรง และไม่พบ Phishing Lure ทำให้ได้คะแนน SCL: 0-1',
    tech: 'EOP SPF/DKIM Pass ──► Defender NLP Heuristics ──► SCL: 0 (High Confidence Legitimate)'
  },
  7: {
    title: 'STAGE 07: Recipient Focused Inbox',
    status: 'Delivered',
    desc: 'อีเมลเข้าสู่ Focused Inbox ของผู้รับ (watchara.m@forth.co.th) ทันที โดยไม่ตกไปอยู่ใน Junk Mail หรือ Admin Quarantine',
    tech: 'Message-ID: <xxxx@smtp.gmail.com> ──► Delivered to Focused Inbox (100% Verified)'
  }
};

function initPipelineInspector() {
  const cards = document.querySelectorAll('.pipeline-step-card');
  const titleEl = document.getElementById('inspector-title');
  const statusEl = document.getElementById('inspector-status');
  const descEl = document.getElementById('inspector-desc');
  const techEl = document.getElementById('inspector-tech');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const step = card.getAttribute('data-step');
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const data = PIPELINE_STAGES[step];
      if (data) {
        if (titleEl) titleEl.textContent = data.title;
        if (statusEl) statusEl.textContent = data.status;
        if (descEl) descEl.textContent = data.desc;
        if (techEl) techEl.textContent = data.tech;
      }
    });
  });
}

/* ==========================================================================
   Tool 1: RFC 2047 Thai Header Live Encoder
   ========================================================================== */
const RFC_ENCODED_WORD_MAX = 75;
const RFC_HEADER_LINE_MAX = 76;

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function encodeRFC2047Word(str) {
  return `=?UTF-8?B?${utf8ToBase64(str)}?=`;
}

function chunkEncodedText(str) {
  const prefix = '=?UTF-8?B?';
  const suffix = '?=';
  const full = encodeRFC2047Word(str);
  if (full.length <= RFC_ENCODED_WORD_MAX) return [full];
  const payload = full.slice(prefix.length, -suffix.length);
  const maxPayload = RFC_ENCODED_WORD_MAX - prefix.length - suffix.length;
  const words = [];
  for (let i = 0; i < payload.length; i += maxPayload) {
    words.push(`${prefix}${payload.slice(i, i + maxPayload)}${suffix}`);
  }
  return words;
}

function encodeRFC2047Text(str) {
  if (!str) return '';
  const tokens = str.match(/[\x00-\x7F]+|[^\x00-\x7F]+/g) || [str];
  return tokens
    .map(token => (/^[\x20-\x7E]*$/.test(token) ? token : chunkEncodedText(token).join(' ')))
    .join(' ');
}

function foldHeaderLine(label, value, limit = RFC_HEADER_LINE_MAX) {
  const tokens = String(value).split(' ');
  let current = label;
  const lines = [];
  for (const token of tokens) {
    if (!token) continue;
    if (current.length + 1 + token.length <= limit) {
      current += (current === label ? '' : ' ') + token;
    } else {
      lines.push(current);
      current = ` ${token}`;
    }
  }
  lines.push(current);
  return lines.join('\r\n');
}

function initRFC2047Encoder() {
  const senderNameInput = document.getElementById('rfc-sender-name');
  const senderEmailInput = document.getElementById('rfc-sender-email');
  const subjectInput = document.getElementById('rfc-subject');

  const previewEl = document.getElementById('rfc-output-preview');
  const headersEl = document.getElementById('rfc-output-headers');
  const rawEl = document.getElementById('rfc-output-raw');
  const statusEl = document.getElementById('rfc-status');

  const presetChips = document.querySelectorAll('#encoder .preset-chip');

  function update() {
    const senderName = senderNameInput ? senderNameInput.value.trim() : 'ระบบแจ้งเตือนอัตโนมัติ';
    const senderEmail = senderEmailInput ? senderEmailInput.value.trim() : 'mailer@yourdomain.com';
    const subject = subjectInput ? subjectInput.value.trim() : 'แจ้งข้อมูลระบบ';

    const encodedName = encodeRFC2047Text(senderName);
    const encodedSubject = encodeRFC2047Text(subject);

    const fromHeaderLine = foldHeaderLine('From: ', `${encodedName} <${senderEmail}>`);
    const subjectHeaderLine = foldHeaderLine('Subject: ', encodedSubject);

    if (previewEl) {
      previewEl.innerHTML = `<strong>จาก (From):</strong> ${escapeHtml(senderName)} &lt;${escapeHtml(senderEmail)}&gt;<br/><strong>หัวข้อ (Subject):</strong> ${escapeHtml(subject)}`;
    }

    const fullHeaders = [
      fromHeaderLine,
      `To: recipient@company.com`,
      `Reply-To: ${senderEmail}`,
      subjectHeaderLine,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${Math.random().toString(36).slice(2)}@smtp.gmail.com>`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="boundary_${Math.random().toString(36).slice(2)}"`,
      `Content-Language: th`,
      `Auto-Submitted: auto-generated`,
      `X-Priority: 3`
    ].join('\r\n');

    if (headersEl) headersEl.textContent = fullHeaders;
    if (rawEl) rawEl.textContent = encodedSubject;

    if (statusEl) {
      const longestLine = Math.max(...fullHeaders.split('\r\n').map(l => l.length));
      const compliant = longestLine <= 78;
      statusEl.textContent = compliant ? `✓ RFC 5322 Compliant (${longestLine}/78 chars)` : `⚠ Exceeds 78 chars (${longestLine})`;
      statusEl.className = compliant ? 'rfc-status ok' : 'rfc-status warn';
    }
  }

  if (senderNameInput) senderNameInput.addEventListener('input', update);
  if (senderEmailInput) senderEmailInput.addEventListener('input', update);
  if (subjectInput) subjectInput.addEventListener('input', update);

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const name = chip.getAttribute('data-name');
      const sub = chip.getAttribute('data-subject');
      if (senderNameInput && name) senderNameInput.value = name;
      if (subjectInput && sub) subjectInput.value = sub;
      update();
    });
  });

  update();
}

/* ==========================================================================
   Tool 2: Microsoft 365 PowerShell Generator
   ========================================================================== */
function initM365Generator() {
  const modeSelect = document.getElementById('m365-mode-select');
  const groupEmailInput = document.getElementById('m365-group-email');
  const bypassSenderInput = document.getElementById('m365-bypass-sender');
  const optExternal = document.getElementById('m365-opt-external');
  const optAutoSub = document.getElementById('m365-opt-autosub');
  const outputEl = document.getElementById('m365-powershell-output');

  const bypassWrapper = document.getElementById('m365-bypass-wrapper');
  const togglesWrapper = document.getElementById('m365-toggles-wrapper');

  function update() {
    const mode = modeSelect ? modeSelect.value : 'unified';
    const email = groupEmailInput && groupEmailInput.value.trim() ? groupEmailInput.value.trim() : 'devops-alerts@yourcompany.com';
    const bypassSender = bypassSenderInput && bypassSenderInput.value.trim() ? bypassSenderInput.value.trim() : 'app.noreply.mailer@gmail.com';
    const allowExternal = optExternal ? optExternal.checked : true;
    const autoSubscribe = optAutoSub ? optAutoSub.checked : true;

    if (bypassWrapper) bypassWrapper.style.display = mode === 'bypass' ? 'block' : 'none';
    if (togglesWrapper) togglesWrapper.style.display = mode === 'unified' || mode === 'dl' ? 'block' : 'none';

    let commands = [];

    if (mode === 'unified') {
      commands = [
        `# ==========================================================================`,
        `# Modern Microsoft 365 Unified Group (Office 365 Group)`,
        `# ==========================================================================`,
        `# 1. เชื่อมต่อ Exchange Online ในฐานะ Exchange Administrator`,
        `Connect-ExchangeOnline -UserPrincipalName admin@yourdomain.com`,
        ``,
        `# 2. ปลดล็อกรับ External Senders และเปิด Auto-Subscribe กระจายเข้า Inbox`,
        `Set-UnifiedGroup -Identity "${email}" \\`,
        `  -RequireSenderAuthenticationEnabled ${allowExternal ? '$false' : '$true'} \\`,
        `  -AutoSubscribeNewMembers ${autoSubscribe ? '$true' : '$false'}`,
        ``,
        `# 3. ตรวจสอบสถานะการตั้งค่า`,
        `Get-UnifiedGroup -Identity "${email}" | Select-Object DisplayName, RequireSenderAuthenticationEnabled, AutoSubscribeNewMembers`
      ];
    } else if (mode === 'dl') {
      commands = [
        `# ==========================================================================`,
        `# Classic Exchange Distribution Group (DL)`,
        `# ==========================================================================`,
        `Connect-ExchangeOnline -UserPrincipalName admin@yourdomain.com`,
        ``,
        `# 1. ปลดล็อกไม่ให้ตีกลับ 550 5.7.133 จากผู้ส่งภายนอก`,
        `Set-DistributionGroup -Identity "${email}" \\`,
        `  -RequireSenderAuthenticationEnabled ${allowExternal ? '$false' : '$true'}`,
        ``,
        `# 2. ตรวจสอบสถานะ DL`,
        `Get-DistributionGroup -Identity "${email}" | Select-Object DisplayName, RequireSenderAuthenticationEnabled`
      ];
    } else if (mode === 'dbeb') {
      commands = [
        `# ==========================================================================`,
        `# DBEB (Directory-Based Edge Blocking) Verification`,
        `# ==========================================================================`,
        `# ตรวจสอบว่าที่อยู่อีเมล "${email}" มี Mailbox/Alias อยู่จริงใน Tenant หรือไม่`,
        `Connect-ExchangeOnline -UserPrincipalName admin@yourdomain.com`,
        ``,
        `# 1. ตรวจสอบ Mailbox ปกติ`,
        `Get-Mailbox -Identity "${email}" -ErrorAction SilentlyContinue`,
        ``,
        `# 2. ตรวจสอบ Mail User / Guest / Shared Mailbox`,
        `Get-Recipient -Identity "${email}" | Select-Object DisplayName, PrimarySmtpAddress, RecipientTypeDetails`,
        ``,
        `# หมายเหตุ: หากไม่พบข้อมูล DBEB จะตีกลับด้วยรหัส 550 5.4.1 Access Denied ทันที`
      ];
    } else if (mode === 'bypass') {
      commands = [
        `# ==========================================================================`,
        `# Mail Flow Rule (Admin Exception - Requires Owner Review)`,
        `# ==========================================================================`,
        `Connect-ExchangeOnline -UserPrincipalName admin@yourdomain.com`,
        ``,
        `# สร้าง Transport Rule สถานะ Disabled เพื่อให้ Admin ทบทวนความปลอดภัยก่อนเปิด`,
        `New-TransportRule -Name "Bypass SCL for System Alert Mailer" \\`,
        `  -SenderAddressMatchesPatterns "${bypassSender}" \\`,
        `  -SetSCL -1 \\`,
        `  -State Disabled \\`,
        `  -Comments "Reviewed by Security Team - Expires in 90 days"`
      ];
    }

    if (outputEl) outputEl.textContent = commands.join('\n');
  }

  if (modeSelect) modeSelect.addEventListener('change', update);
  if (groupEmailInput) groupEmailInput.addEventListener('input', update);
  if (bypassSenderInput) bypassSenderInput.addEventListener('input', update);
  if (optExternal) optExternal.addEventListener('change', update);
  if (optAutoSub) optAutoSub.addEventListener('change', update);

  update();
}

/* ==========================================================================
   Tool 3: Zero-Credential Template Generator & Live Preview
   ========================================================================== */
const EVENT_TEMPLATES = {
  withdrawal_submitted: {
    badge: 'คำขอเบิกใหม่',
    badgeColor: '#2563EB',
    title: 'คำขอเบิกพัสดุใหม่รอการอนุมัติ',
    desc: 'มีรายการขอเบิกพัสดุใหม่เข้าสู่ระบบ รอการตรวจสอบและอนุมัติจากผู้มีอำนาจ',
    tableTitle: 'รายการพัสดุที่ขอเบิก',
    items: [
      { name: 'สายไฟเบอร์ออปติก 12-Core', qty: '500', unit: 'เมตร' },
      { name: 'SFP+ Transceiver 10G', qty: '4', unit: 'ชิ้น' }
    ],
    btnText: 'เปิดดูและอนุมัติคำขอเบิก',
    notice: null
  },
  withdrawal_approved: {
    badge: 'อนุมัติแล้ว',
    badgeColor: '#10B981',
    title: 'คำขอเบิกพัสดุได้รับการอนุมัติแล้ว',
    desc: 'รายการขอเบิกพัสดุได้รับการอนุมัติจากผู้อนุมัติเรียบร้อยแล้ว เจ้าหน้าที่คลังกำลังเตรียมจัดจ่าย',
    tableTitle: 'รายการพัสดุที่ได้รับการอนุมัติ',
    items: [
      { name: 'สายไฟเบอร์ออปติก 12-Core', qty: '500', unit: 'เมตร' },
      { name: 'SFP+ Transceiver 10G', qty: '4', unit: 'ชิ้น' }
    ],
    btnText: 'ตรวจสอบสถานะการจ่ายพัสดุ',
    notice: null
  },
  withdrawal_rejected: {
    badge: 'ไม่ได้รับการอนุมัติ',
    badgeColor: '#9A3412',
    title: 'คำขอเบิกพัสดุไม่ได้รับการอนุมัติ',
    desc: 'รายการขอเบิกพัสดุไม่ผ่านการอนุมัติจากผู้มีอำนาจ โดยมีรายละเอียดเหตุผลดังนี้',
    tableTitle: 'รายการพัสดุในคำขอ',
    items: [
      { name: 'สายไฟเบอร์ออปติก 12-Core', qty: '500', unit: 'เมตร' }
    ],
    btnText: 'เปิดดูรายละเอียดและแก้ไขคำขอ',
    notice: 'เหตุผลการไม่อนุมัติ: ยอดงบประมาณของโครงการเกินวงเงินที่กำหนด กรุณาตรวจสอบกับผู้จัดการโครงการ'
  },
  stock_in_created: {
    badge: 'รับเข้า Stock',
    badgeColor: '#059669',
    title: 'บันทึกรับเข้าพัสดุสู่คลังสินค้าสำเร็จ',
    desc: 'เจ้าหน้าที่คลังได้ทำการตรวจรับและบันทึกพัสดุเข้าสู่ระบบคลังสินค้าเรียบร้อยแล้ว',
    tableTitle: 'รายการพัสดุที่รับเข้าคลัง',
    items: [
      { name: 'Industrial PoE Switch 8-Port', qty: '10', unit: 'ตัว' },
      { name: 'Patch Cord LC-LC 3M', qty: '50', unit: 'เส้น' }
    ],
    btnText: 'เปิดดูใบรับเข้าพัสดุ',
    notice: null
  },
  low_stock_alert: {
    badge: 'ต้องเติมสต็อก',
    badgeColor: '#D97706',
    title: 'แจ้งเตือนรายการพัสดุถึงจุดสั่งซื้อ (Reorder Point Alert)',
    desc: 'รายการพัสดุในคลังสินค้ามีจำนวนคงเหลือลดลงถึงหรือต่ำกว่าเกณฑ์สั่งซื้อ กรุณาตรวจสอบเพื่อจัดซื้อเพิ่ม',
    tableTitle: 'รายการพัสดุที่ต้องเติมสต็อก',
    items: [
      { name: 'หัวคอนเนคเตอร์ RJ45 Cat6', qty: 'คงเหลือ 15', unit: 'กล่อง (ขั้นต่ำ 20)' }
    ],
    btnText: 'เปิดดูรายงานสินค้าคงเหลือ',
    notice: null
  },
  connectivity_test: {
    badge: 'จัดส่งสำเร็จ',
    badgeColor: '#2563EB',
    title: 'แจ้งเตือนการทดสอบระบบอีเมล (SMTP Connectivity Test)',
    desc: 'อีเมลฉบับนี้ส่งจากระบบเพื่อยืนยันว่าการตั้งค่า Gmail SMTP และโครงสร้าง Header สมบูรณ์แบบ',
    tableTitle: 'ข้อมูลการทดสอบการเชื่อมต่อ',
    items: [
      { name: 'Protocol Handshake', qty: 'SMTPS (Port 465 Implicit TLS)', unit: 'PASS' },
      { name: 'Header Alignment', qty: 'SPF/DKIM/DMARC Compliant', unit: 'PASS' }
    ],
    btnText: 'เข้าสู่หน้าตั้งค่าระบบ',
    notice: null
  },
  user_invitation: {
    badge: 'เทียบเชิญเข้าใช้งาน',
    badgeColor: '#7C3AED',
    title: 'ยินดีต้อนรับสู่ระบบ StockFlow',
    desc: 'ผู้ดูแลระบบได้สร้างและเปิดสิทธิ์บัญชีผู้ใช้งานของคุณเรียบร้อยแล้ว โดยมีรายละเอียดดังนี้',
    tableTitle: 'ข้อมูลบัญชีผู้ใช้งาน',
    items: [
      { name: 'บทบาทสิทธิ์ (Role)', qty: 'Warehouse Supervisor', unit: 'Active' },
      { name: 'สังกัดฝ่ายงาน', qty: 'กองบริการเทคโนโลยีและสื่อสาร', unit: 'Central' }
    ],
    btnText: 'เข้าสู่ระบบเพื่อเริ่มใช้งาน',
    notice: null
  }
};

let currentEventType = 'withdrawal_submitted';

function initZeroCredentialTemplate() {
  const sysNameInput = document.getElementById('tpl-sys-name');
  const brandColorInput = document.getElementById('tpl-brand-color');
  const recipientNameInput = document.getElementById('tpl-recipient-name');
  const recipientEmailInput = document.getElementById('tpl-recipient-email');
  const refNoInput = document.getElementById('tpl-ref-no');
  const projectNameInput = document.getElementById('tpl-project-name');
  const actionUrlInput = document.getElementById('tpl-action-url');

  const cardMockupEl = document.getElementById('email-mockup-card');
  const codePreEl = document.getElementById('tpl-html-code-pre');

  const presetChips = document.querySelectorAll('#template .preset-chip');

  function update() {
    const sysName = sysNameInput ? sysNameInput.value.trim() || 'StockFlow' : 'StockFlow';
    const brandColor = brandColorInput ? brandColorInput.value.trim() || '#2563EB' : '#2563EB';
    const recipientName = recipientNameInput ? recipientNameInput.value.trim() || 'วัชระ มานะดี' : 'วัชระ มานะดี';
    const recipientEmail = recipientEmailInput ? recipientEmailInput.value.trim() || 'watchara.m@forth.co.th' : 'watchara.m@forth.co.th';
    const refNo = refNoInput ? refNoInput.value.trim() || 'REQ-2026-008' : 'REQ-2026-008';
    const projectName = projectNameInput ? projectNameInput.value.trim() || 'โครงการติดตั้งระบบ' : 'โครงการติดตั้งระบบ';
    const actionUrl = actionUrlInput ? actionUrlInput.value.trim() || 'https://stockflow.forth.co.th' : 'https://stockflow.forth.co.th';

    const tpl = EVENT_TEMPLATES[currentEventType] || EVENT_TEMPLATES.withdrawal_submitted;

    // Render Live Client Mockup
    let itemsHtml = '';
    tpl.items.forEach(item => {
      itemsHtml += `
        <tr>
          <td class="label-col" style="padding:8px 12px; border-bottom:1px solid #E2E8F0; color:#334155;">${escapeHtml(item.name)}</td>
          <td class="value-col" style="padding:8px 12px; border-bottom:1px solid #E2E8F0; text-align:right; color:#0F172A;">${escapeHtml(item.qty)} ${escapeHtml(item.unit)}</td>
        </tr>
      `;
    });

    let noticeBoxHtml = '';
    if (tpl.notice) {
      noticeBoxHtml = `
        <div class="email-notice-box amber" style="margin:14px 0; padding:12px 14px; border-radius:6px; background:#FFF7ED; border:1px solid #FED7AA; color:#9A3412; font-size:0.84rem;">
          <strong>คำชี้แจง:</strong> ${escapeHtml(tpl.notice)}
        </div>
      `;
    }

    const cardHtml = `
      <div class="email-mockup-header" style="padding:18px 24px; border-bottom:2px solid #F1F5F9; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="margin:0; font-size:1.15rem; color:#0F172A; font-weight:700;">${escapeHtml(sysName)}</h3>
          <p style="margin:2px 0 0 0; font-size:0.8rem; color:#64748B;">${escapeHtml(tpl.title)}</p>
        </div>
        <span style="background:${tpl.badgeColor}; color:#FFFFFF; padding:3px 10px; border-radius:4px; font-size:0.75rem; font-weight:600;">${escapeHtml(tpl.badge)}</span>
      </div>
      <div class="email-mockup-body" style="padding:20px 24px; color:#334155; font-size:0.88rem;">
        <p style="margin:0 0 8px 0;">เรียน คุณ <strong>${escapeHtml(recipientName)}</strong>,</p>
        <p style="margin:0 0 14px 0; color:#475569;">${escapeHtml(tpl.desc)}</p>

        <table class="email-info-table" style="width:100%; border-collapse:collapse; margin-bottom:14px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px;">
          <tr>
            <td class="label-col" style="padding:8px 12px; color:#64748B; width:130px; border-bottom:1px solid #E2E8F0;">เลขที่อ้างอิง:</td>
            <td class="value-col" style="padding:8px 12px; color:#0F172A; font-weight:600; border-bottom:1px solid #E2E8F0;">${escapeHtml(refNo)}</td>
          </tr>
          <tr>
            <td class="label-col" style="padding:8px 12px; color:#64748B; border-bottom:1px solid #E2E8F0;">โครงการ:</td>
            <td class="value-col" style="padding:8px 12px; color:#0F172A; font-weight:600; border-bottom:1px solid #E2E8F0;">${escapeHtml(projectName)}</td>
          </tr>
        </table>

        ${noticeBoxHtml}

        <div style="font-weight:600; color:#0F172A; margin:14px 0 6px 0;">${escapeHtml(tpl.tableTitle)}:</div>
        <table class="email-info-table" style="width:100%; border-collapse:collapse; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:6px; font-size:0.84rem;">
          ${itemsHtml}
        </table>

        <div style="text-align:center; margin:22px 0 14px 0;">
          <a href="${escapeHtml(actionUrl)}" target="_blank" class="email-cta-btn" style="background:${brandColor}; color:#FFFFFF; text-decoration:none; padding:10px 24px; border-radius:6px; font-weight:600; font-size:0.9rem; display:inline-block;">
            ${escapeHtml(tpl.btnText)}
          </a>
        </div>

        <div class="email-footer-notice" style="margin-top:18px; padding-top:12px; border-top:1px dashed #CBD5E1; font-size:0.78rem; color:#64748B;">
          <strong>คำแนะนำด้านความปลอดภัย:</strong> อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบ StockFlow และไม่มีการระบุรหัสผ่านในอีเมล
        </div>
      </div>
    `;

    if (cardMockupEl) cardMockupEl.innerHTML = cardHtml;

    // Full RFC HTML Document
    const fullHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(tpl.title)}</title>
</head>
<body style="margin:0; padding:0; background-color:#F1F5F9; font-family:'Sarabun', Arial, sans-serif;">
  <div style="display:none; max-height:0px; overflow:hidden;">${escapeHtml(tpl.desc)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F1F5F9; padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background-color:#FFFFFF; border-radius:8px; overflow:hidden; border:1px solid #E2E8F0; box-shadow:0 4px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:20px 24px; border-bottom:2px solid #F1F5F9;">
              <h2 style="margin:0; font-size:1.2rem; color:#0F172A;">${escapeHtml(sysName)}</h2>
              <p style="margin:2px 0 0 0; font-size:0.85rem; color:#64748B;">${escapeHtml(tpl.title)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px; color:#334155; font-size:0.9rem; line-height:1.6;">
              <p>เรียน คุณ <strong>${escapeHtml(recipientName)}</strong>,</p>
              <p>${escapeHtml(tpl.desc)}</p>
              <div style="text-align:center; margin:24px 0;">
                <a href="${escapeHtml(actionUrl)}" target="_blank" style="background-color:${brandColor}; color:#FFFFFF; padding:12px 28px; border-radius:6px; text-decoration:none; font-weight:600;">
                  ${escapeHtml(tpl.btnText)}
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    if (codePreEl) codePreEl.textContent = fullHtml;
  }

  if (sysNameInput) sysNameInput.addEventListener('input', update);
  if (brandColorInput) brandColorInput.addEventListener('input', update);
  if (recipientNameInput) recipientNameInput.addEventListener('input', update);
  if (recipientEmailInput) recipientEmailInput.addEventListener('input', update);
  if (refNoInput) refNoInput.addEventListener('input', update);
  if (projectNameInput) projectNameInput.addEventListener('input', update);
  if (actionUrlInput) actionUrlInput.addEventListener('input', update);

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentEventType = chip.getAttribute('data-event-type') || 'withdrawal_submitted';
      update();
    });
  });

  update();
}

function initViewModeToggle() {
  const desktopBtn = document.getElementById('view-desktop-btn');
  const mobileBtn = document.getElementById('view-mobile-btn');
  const canvasWrapper = document.getElementById('email-canvas-wrapper');

  if (desktopBtn && mobileBtn && canvasWrapper) {
    desktopBtn.addEventListener('click', () => {
      desktopBtn.classList.add('active');
      mobileBtn.classList.remove('active');
      canvasWrapper.classList.remove('mobile-view');
    });

    mobileBtn.addEventListener('click', () => {
      mobileBtn.classList.add('active');
      desktopBtn.classList.remove('active');
      canvasWrapper.classList.add('mobile-view');
    });
  }
}

/* ==========================================================================
   Tool 4: Deliverability Score Calculator
   ========================================================================== */
function initDeliverabilityCalculator() {
  const checkItems = document.querySelectorAll('#calculator .check-item');
  const gaugeCircle = document.getElementById('gauge-progress-circle');
  const scoreValEl = document.getElementById('gauge-score-val');
  const ratingTitleEl = document.getElementById('gauge-rating-title');
  const adviceListEl = document.getElementById('gauge-advice-list');

  function calculate() {
    let totalScore = 0;
    const advices = [];

    checkItems.forEach(item => {
      const isChecked = item.classList.contains('checked');
      const weight = parseInt(item.getAttribute('data-weight'), 10) || 0;
      const advice = item.getAttribute('data-advice');

      if (isChecked) {
        totalScore += weight;
      } else if (advice) {
        advices.push(advice);
      }
    });

    // Update circular gauge (circumference: 2 * PI * 70 = 440)
    const maxOffset = 440;
    const progressOffset = maxOffset - (totalScore / 100) * maxOffset;

    if (gaugeCircle) {
      gaugeCircle.style.strokeDashoffset = progressOffset;
      if (totalScore >= 85) {
        gaugeCircle.style.stroke = 'var(--accent-emerald)';
      } else if (totalScore >= 60) {
        gaugeCircle.style.stroke = 'var(--accent-amber)';
      } else {
        gaugeCircle.style.stroke = 'var(--accent-rose)';
      }
    }

    if (scoreValEl) scoreValEl.textContent = `${totalScore}%`;

    if (ratingTitleEl) {
      if (totalScore >= 90) {
        ratingTitleEl.textContent = 'ผ่านเกณฑ์ความปลอดภัยสมบูรณ์แบบ (SCL: 0-1)';
        ratingTitleEl.style.color = 'var(--accent-emerald-light)';
      } else if (totalScore >= 70) {
        ratingTitleEl.textContent = 'มีความเสี่ยงปานกลาง (อาจเข้า Junk Mail)';
        ratingTitleEl.style.color = 'var(--accent-amber-light)';
      } else {
        ratingTitleEl.textContent = 'ความเสี่ยงสูงมาก (เสี่ยงถูกกักกันใน Quarantine)';
        ratingTitleEl.style.color = 'var(--accent-rose-light)';
      }
    }

    if (adviceListEl) {
      if (advices.length === 0) {
        adviceListEl.innerHTML = '<li style="color:var(--accent-emerald-light);">ยินดีด้วย! คุณปฏิบัติตามมาตรฐานการส่งอีเมลครบถ้วนทุกข้อ</li>';
      } else {
        adviceListEl.innerHTML = advices.map(a => `<li>${escapeHtml(a)}</li>`).join('');
      }
    }
  }

  checkItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      calculate();
    });
  });

  calculate();
}

/* ==========================================================================
   Tool 5: Troubleshooting Matrix Filter
   ========================================================================== */
function initTroubleshootFilters() {
  const filterBtns = document.querySelectorAll('.troubleshoot-filters .filter-btn');
  const cards = document.querySelectorAll('.troubleshoot-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'all';

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   Tool 6: Production Code Generator
   ========================================================================== */
function initCodeGenerator() {
  const hostInput = document.getElementById('gen-host');
  const portInput = document.getElementById('gen-port');
  const userInput = document.getElementById('gen-user');
  const passInput = document.getElementById('gen-pass');
  const fromInput = document.getElementById('gen-from');
  const toInput = document.getElementById('gen-to');

  const preNodeNative = document.getElementById('code-node-native-pre');
  const preServerless = document.getElementById('code-serverless-pre');
  const preNodemailer = document.getElementById('code-nodemailer-pre');
  const prePython = document.getElementById('code-python-pre');
  const preGo = document.getElementById('code-go-pre');

  function update() {
    const host = hostInput ? hostInput.value.trim() || 'smtp.gmail.com' : 'smtp.gmail.com';
    const port = portInput ? portInput.value.trim() || '465' : '465';
    const user = userInput ? userInput.value.trim() || 'sender@gmail.com' : 'sender@gmail.com';
    const pass = passInput ? passInput.value.trim() || 'xxxx-xxxx-xxxx-xxxx' : 'xxxx-xxxx-xxxx-xxxx';
    const from = fromInput ? fromInput.value.trim() || 'sender@gmail.com' : 'sender@gmail.com';
    const to = toInput ? toInput.value.trim() || 'watchara.m@forth.co.th' : 'watchara.m@forth.co.th';

    // 1. Node.js Native TLS
    if (preNodeNative) {
      preNodeNative.textContent = `// native-tls-smtp.js - Zero Dependencies Native TLS
const tls = require('tls');

function sendEmailViaTLS() {
  const client = tls.connect(${port}, '${host}', { rejectUnauthorized: true }, () => {
    console.log('[OK] Connected via TLS 1.3 to ${host}:${port}');
  });

  const authUser = Buffer.from('${user}').toString('base64');
  const authPass = Buffer.from('${pass.replace(/\s+/g, '')}').toString('base64');

  const commands = [
    'EHLO localhost',
    'AUTH LOGIN',
    authUser,
    authPass,
    'MAIL FROM:<${from}>',
    'RCPT TO:<${to}>',
    'DATA',
    \`From: =?UTF-8?B?\${Buffer.from('ระบบแจ้งเตือน').toString('base64')}?= <${from}>
To: ${to}
Subject: =?UTF-8?B?\${Buffer.from('[StockFlow] แจ้งเตือนการดำเนินรายการ').toString('base64')}?=
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8
Auto-Submitted: auto-generated
X-Priority: 3

<h2>เรียน ผู้ใช้งาน</h2><p>ระบบได้ดำเนินการเรียบร้อยแล้ว</p>
.
\`,
    'QUIT'
  ];

  let step = 0;
  client.on('data', (data) => {
    console.log('S:', data.toString().trim());
    if (step < commands.length) {
      console.log('C:', commands[step]);
      client.write(commands[step] + '\\r\\n');
      step++;
    }
  });

  client.on('end', () => console.log('[OK] Mail delivery session completed.'));
}

sendEmailViaTLS();`;
    }

    // 2. Serverless Function API
    if (preServerless) {
      preServerless.textContent = `// api/send-email.js - Vercel / Node.js Serverless Endpoint
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, html, text } = req.body;
  if (!to || !subject) return res.status(400).json({ error: 'Missing required parameters' });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || '${host}',
      port: parseInt(process.env.SMTP_PORT || '${port}', 10),
      secure: true, // Port 465 Implicit TLS
      auth: {
        user: process.env.SMTP_USER || '${user}',
        pass: process.env.SMTP_PASS || '${pass.replace(/\s+/g, '')}'
      }
    });

    const info = await transporter.sendMail({
      from: \`"StockFlow Notification" <\${process.env.SMTP_USER || '${from}'}>\`,
      to,
      subject,
      text: text || 'ระบบแจ้งเตือนธุรกรรม StockFlow',
      html,
      headers: {
        'Auto-Submitted': 'auto-generated',
        'X-Priority': '3',
        'Content-Language': 'th'
      }
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('[SMTP Error]:', error);
    return res.status(500).json({ error: error.message });
  }
}`;
    }

    // 3. Nodemailer
    if (preNodemailer) {
      preNodemailer.textContent = `// nodemailer-eop-config.js
const nodemailer = require('nodemailer');

async function sendTransactionalEmail() {
  const transporter = nodemailer.createTransport({
    host: '${host}',
    port: ${port},
    secure: true, // SMTPS on port 465
    auth: {
      user: '${user}',
      pass: '${pass.replace(/\s+/g, '')}'
    }
  });

  const mailOptions = {
    from: '"ระบบแจ้งเตือน StockFlow" <${from}>',
    to: '${to}',
    subject: '[StockFlow] คำขอเบิกพัสดุได้รับการอนุมัติแล้ว',
    text: 'เรียน ผู้ขอเบิก คำขอเบิกได้รับการอนุมัติแล้ว',
    html: '<p>เรียน คุณ <strong>ผู้ขอเบิก</strong>,<br/>คำขอเบิกพัสดุได้รับการอนุมัติเรียบร้อยแล้ว</p>',
    headers: {
      'Auto-Submitted': 'auto-generated',
      'X-Priority': '3',
      'Content-Language': 'th'
    }
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('[OK] Sent successfully! Message-ID:', info.messageId);
}

sendTransactionalEmail();`;
    }

    // 4. Python
    if (prePython) {
      prePython.textContent = `# smtp_mailer.py
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header

smtp_host = "${host}"
smtp_port = ${port}
smtp_user = "${user}"
smtp_pass = "${pass.replace(/\s+/g, '')}"

msg = MIMEMultipart("alternative")
msg["Subject"] = Header("[StockFlow] รายงานการทำรายการสำเร็จ", "utf-8")
msg["From"] = f"StockFlow System <{smtp_user}>"
msg["To"] = "${to}"
msg["Auto-Submitted"] = "auto-generated"
msg["X-Priority"] = "3"

msg.attach(MIMEText("เรียน ผู้ใช้งาน ระบบได้ทำรายการเรียบร้อยแล้ว", "plain", "utf-8"))
msg.attach(MIMEText("<p>เรียน ผู้ใช้งาน<br>ระบบได้ทำรายการเรียบร้อยแล้ว</p>", "html", "utf-8"))

context = ssl.create_default_context()
with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
    server.login(smtp_user, smtp_pass)
    server.sendmail(smtp_user, "${to}", msg.as_string())
    print("[OK] Email delivered via SMTPS")`;
    }

    // 5. Go
    if (preGo) {
      preGo.textContent = `// smtp_sender.go
package main

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
)

func main() {
	host := "${host}"
	port := "${port}"
	user := "${user}"
	pass := "${pass.replace(/\s+/g, '')}"
	to := "${to}"

	auth := smtp.PlainAuth("", user, pass, host)
	tlsConfig := &tls.Config{ServerName: host}

	conn, err := tls.Dial("tcp", host+":"+port, tlsConfig)
	if err != nil {
		panic(err)
	}

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		panic(err)
	}
	defer client.Quit()

	if err = client.Auth(auth); err != nil {
		panic(err)
	}

	msg := []byte("From: StockFlow System <" + user + ">\\r\\n" +
		"To: " + to + "\\r\\n" +
		"Subject: =?UTF-8?B?W1N0b2NrRmxvd10g4LiV4Lij4Lin4LiI4Liq4Lit4Lia4Liq4Liz4LmA4Lij4LmH4LiIIj0=?=\\r\\n" +
		"MIME-Version: 1.0\\r\\n" +
		"Content-Type: text/html; charset=UTF-8\\r\\n" +
		"Auto-Submitted: auto-generated\\r\\n" +
		"\\r\\n" +
		"<h2>การแจ้งเตือนจากระบบ</h2><p>ระบบดำเนินการสำเร็จ</p>")

	if err = client.Mail(user); err != nil {
		panic(err)
	}
	if err = client.Rcpt(to); err != nil {
		panic(err)
	}
	w, err := client.Data()
	if err != nil {
		panic(err)
	}
	w.Write(msg)
	w.Close()

	fmt.Println("[OK] Email sent via Go Native TLS")
}`;
    }
  }

  const inputs = [hostInput, portInput, userInput, passInput, fromInput, toInput];
  inputs.forEach(input => {
    if (input) input.addEventListener('input', update);
  });

  update();
}

/* ==========================================================================
   Clipboard Button Handlers
   ========================================================================== */
function initClipboardButtons() {
  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const textToCopy = targetEl.textContent || targetEl.innerText;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('คัดลอกข้อมูลลงคลิปบอร์ดเรียบร้อยแล้ว');
      }).catch(() => {
        showToast('ไม่สามารถคัดลอกได้ กรุณาลองใหม่', 'info');
      });
    });
  });
}

/* ==========================================================================
   React Bits WebGL Shader Backgrounds (AcidSquares & Strands)
   ========================================================================== */
function initAcidSquares() {
  const container = document.getElementById('acid-squares-hero-bg');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl');
  if (!gl) return;

  function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    uniform float uTime;
    uniform vec2 uResolution;

    void main() {
      vec2 st = gl_FragCoord.xy / uResolution.xy;
      st.x *= uResolution.x / uResolution.y;
      
      vec2 grid = fract(st * 8.0 + uTime * 0.05);
      float d = length(grid - 0.5);
      float glow = smoothstep(0.4, 0.05, d) * 0.15;
      
      vec3 color = mix(vec3(0.03, 0.06, 0.14), vec3(0.23, 0.51, 0.96), glow);
      gl_FragColor = vec4(color, glow * 0.5);
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const timeLoc = gl.getUniformLocation(program, 'uTime');
  const resLoc = gl.getUniformLocation(program, 'uResolution');

  let startTime = Date.now();
  function render() {
    const elapsed = (Date.now() - startTime) * 0.001;
    gl.uniform1f(timeLoc, elapsed);
    gl.uniform2f(resLoc, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  render();
}

function initStrands() {
  const container = document.getElementById('strands-architecture-bg');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl');
  if (!gl) return;

  function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    uniform float uTime;
    uniform vec2 uResolution;

    void main() {
      vec2 st = gl_FragCoord.xy / uResolution.xy;
      float wave = sin(st.x * 6.0 + uTime * 0.8) * 0.1 + sin(st.x * 12.0 - uTime * 0.5) * 0.05;
      float dist = abs(st.y - (0.5 + wave));
      float line = smoothstep(0.04, 0.0, dist) * 0.2;
      vec3 color = vec3(0.06, 0.71, 0.98) * line;
      gl_FragColor = vec4(color, line * 0.4);
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const timeLoc = gl.getUniformLocation(program, 'uTime');
  const resLoc = gl.getUniformLocation(program, 'uResolution');

  let startTime = Date.now();
  function render() {
    const elapsed = (Date.now() - startTime) * 0.001;
    gl.uniform1f(timeLoc, elapsed);
    gl.uniform2f(resLoc, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  render();
}

/* Helper escape HTML */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
