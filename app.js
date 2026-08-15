/**
 * Gmail SMTP & Deliverability Skill - Interactive Web Engine (UI/UX Pro Max)
 * Pure vanilla JavaScript - Zero external runtime dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initRFC2047Encoder();
  initM365Generator();
  initDeliverabilityCalculator();
  initCodeGenerator();
  initClipboardButtons();
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
  document.querySelectorAll('.tabs-nav').forEach(nav => {
    const buttons = nav.querySelectorAll('.tab-btn');
    const container = nav.closest('.tab-wrapper') || nav.parentElement;
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        
        buttons.forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        
        btn.classList.add('active');
        const targetContent = container.querySelector(`#${targetId}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  });
}

/* ==========================================================================
   Tool 1: RFC 2047 Thai Header Live Encoder
   ========================================================================== */
function encodeRFC2047(str) {
  if (!str) return '';
  // Check if string contains only ASCII standard characters
  if (/^[\x20-\x7E]*$/.test(str)) {
    return str;
  }
  // Convert UTF-8 string to Base64 in browser
  const utf8Bytes = new TextEncoder().encode(str);
  let binaryStr = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryStr += String.fromCharCode(utf8Bytes[i]);
  }
  const base64 = btoa(binaryStr);
  return `=?UTF-8?B?${base64}?=`;
}

function initRFC2047Encoder() {
  const nameInput = document.getElementById('rfc-sender-name');
  const emailInput = document.getElementById('rfc-sender-email');
  const subjectInput = document.getElementById('rfc-subject');
  
  const outputRaw = document.getElementById('rfc-output-raw');
  const outputHeaders = document.getElementById('rfc-output-headers');

  function update() {
    const senderName = nameInput ? nameInput.value.trim() : 'ระบบแจ้งเตือนอัตโนมัติ';
    const senderEmail = emailInput ? emailInput.value.trim() : 'mailer@yourdomain.com';
    const subject = subjectInput ? subjectInput.value.trim() : 'รายงานสรุปผลประจำวัน (Daily Summary)';

    const encodedName = encodeRFC2047(senderName);
    const encodedSubject = encodeRFC2047(subject);

    if (outputRaw) {
      outputRaw.textContent = `Subject: ${encodedSubject}`;
    }

    if (outputHeaders) {
      outputHeaders.textContent = 
`From: ${encodedName} <${senderEmail}>
Subject: ${encodedSubject}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="----=_Part_01"`;
    }
  }

  if (nameInput) nameInput.addEventListener('input', update);
  if (emailInput) emailInput.addEventListener('input', update);
  if (subjectInput) subjectInput.addEventListener('input', update);
  update();
}

/* ==========================================================================
   Tool 2: Microsoft 365 Group PowerShell Generator
   ========================================================================== */
function initM365Generator() {
  const groupEmailInput = document.getElementById('m365-group-email');
  const optExternal = document.getElementById('m365-opt-external');
  const optAutoSub = document.getElementById('m365-opt-autosub');
  const outputEl = document.getElementById('m365-powershell-output');

  function update() {
    const email = groupEmailInput && groupEmailInput.value.trim() ? groupEmailInput.value.trim() : 'devops-alerts@company.com';
    const allowExternal = optExternal ? optExternal.checked : true;
    const autoSubscribe = optAutoSub ? optAutoSub.checked : true;

    const commands = [
      `# 1. Connect to Exchange Online (Run once in PowerShell as Admin)`,
      `Connect-ExchangeOnline -UserPrincipalName admin@yourdomain.com`,
      ``,
      `# 2. Configure M365 Unified Group Delivery Policy`,
      `Set-UnifiedGroup -Identity "${email}" \\`,
      `  -RequireSenderAuthenticationEnabled ${allowExternal ? '$false' : '$true'} \\`,
      `  -AutoSubscribeNewMembers ${autoSubscribe ? '$true' : '$false'}`,
      ``,
      `# 3. Verify Group Configuration Status`,
      `Get-UnifiedGroup -Identity "${email}" | Select-Object DisplayName, RequireSenderAuthenticationEnabled, AutoSubscribeNewMembers`
    ];

    if (outputEl) {
      outputEl.textContent = commands.join('\n');
    }
  }

  if (groupEmailInput) groupEmailInput.addEventListener('input', update);
  if (optExternal) optExternal.addEventListener('change', update);
  if (optAutoSub) optAutoSub.addEventListener('change', update);
  update();
}

/* ==========================================================================
   Tool 3: Anti-Spam Deliverability Score Calculator
   ========================================================================== */
function initDeliverabilityCalculator() {
  const checkItems = document.querySelectorAll('.calc-checklist .check-item');
  const gaugeVal = document.getElementById('calc-score-value');
  const gaugeCircle = document.getElementById('calc-gauge-circle');
  const ratingText = document.getElementById('calc-rating-text');
  const adviceList = document.getElementById('calc-advice-list');

  function calculate() {
    let totalScore = 0;
    const pendingAdvices = [];

    checkItems.forEach(item => {
      const isChecked = item.classList.contains('checked');
      const weight = parseInt(item.getAttribute('data-weight'), 10) || 15;
      const advice = item.getAttribute('data-advice') || '';

      if (isChecked) {
        totalScore += weight;
      } else if (advice) {
        pendingAdvices.push(advice);
      }
    });

    // Clamp score
    totalScore = Math.min(100, Math.max(0, totalScore));

    if (gaugeVal) gaugeVal.textContent = `${totalScore}%`;

    // Color & Degree
    let strokeColor = '#10B981'; // Emerald
    let ratingLabel = 'Excellent (พร้อมส่ง Inbox 99.8%)';
    if (totalScore < 60) {
      strokeColor = '#EF4444'; // Red
      ratingLabel = 'Critical (มีความเสี่ยงตก Junk/Spam สูง)';
    } else if (totalScore < 85) {
      strokeColor = '#F59E0B'; // Amber
      ratingLabel = 'Moderate (ควรปรับปรุง Header & Auth)';
    }

    if (gaugeCircle) {
      const deg = (totalScore / 100) * 360;
      gaugeCircle.style.background = `conic-gradient(${strokeColor} 0deg, ${strokeColor} ${deg}deg, rgba(255, 255, 255, 0.08) ${deg}deg)`;
    }

    if (ratingText) {
      ratingText.textContent = ratingLabel;
      ratingText.style.color = strokeColor;
    }

    if (adviceList) {
      if (pendingAdvices.length === 0) {
        adviceList.innerHTML = `<li style="color:#10B981;">ผ่านเกณฑ์มาตรฐานทั้งหมด ระบบพร้อมใช้งานอย่างสมบูรณ์แบบ</li>`;
      } else {
        adviceList.innerHTML = pendingAdvices.map(a => `<li>${a}</li>`).join('');
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
   Tool 4: Dynamic Code Generator
   ========================================================================== */
function initCodeGenerator() {
  const hostInput = document.getElementById('gen-host');
  const portInput = document.getElementById('gen-port');
  const userInput = document.getElementById('gen-user');
  const passInput = document.getElementById('gen-pass');
  const fromInput = document.getElementById('gen-from');
  const toInput = document.getElementById('gen-to');

  const nodeCodeEl = document.getElementById('code-node-native');
  const nodemailerCodeEl = document.getElementById('code-nodemailer');
  const pythonCodeEl = document.getElementById('code-python');

  function update() {
    const host = hostInput ? hostInput.value.trim() : 'smtp.gmail.com';
    const port = portInput ? portInput.value.trim() : '465';
    const user = userInput ? userInput.value.trim() : 'your-email@gmail.com';
    const pass = passInput ? passInput.value.trim() : 'your-16-char-app-password';
    const from = fromInput ? fromInput.value.trim() : 'your-email@gmail.com';
    const to = toInput ? toInput.value.trim() : 'recipient@domain.com';

    if (nodeCodeEl) {
      nodeCodeEl.textContent = 
`import { sendEmail } from './examples/smtp-send-example.js';

// Production Native TLS SMTP Sender (Zero External Dependencies)
await sendEmail({
  user: '${user}',
  pass: '${pass}',
  fromEmail: '${from}',
  fromName: 'ระบบแจ้งเตือนอัตโนมัติ',
  toEmail: '${to}',
  subject: 'รายงานประจำวัน (Daily Status Report)',
  textContent: 'สวัสดีครับ นี่คืออีเมล Plaintext มาตรฐาน RFC 5322',
  htmlContent: '<h1 style="color:#0078D4;">สวัสดีครับ</h1><p>เนื้อหาอีเมลแบบ HTML</p>'
});
console.log('Email delivered successfully!');`;
    }

    if (nodemailerCodeEl) {
      nodemailerCodeEl.textContent = 
`import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: '${host}',
  port: ${port},
  secure: ${port === '465' ? 'true' : 'false'},
  auth: {
    user: '${user}',
    pass: '${pass}',
  },
});

await transporter.sendMail({
  from: '"ระบบแจ้งเตือน" <${from}>',
  to: '${to}',
  subject: 'ทดสอบส่งผ่าน Nodemailer',
  text: 'ข้อความ Plain Text',
  html: '<b>ข้อความ HTML</b>',
});`;
    }

    if (pythonCodeEl) {
      pythonCodeEl.textContent = 
`import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header

msg = MIMEMultipart('alternative')
msg['Subject'] = Header('รายงานประจำวัน', 'utf-8')
msg['From'] = f'{Header("ระบบแจ้งเตือน", "utf-8").encode()} <${from}>'
msg['To'] = '${to}'

msg.attach(MIMEText('Plaintext version', 'plain', 'utf-8'))
msg.attach(MIMEText('<h1>HTML version</h1>', 'html', 'utf-8'))

with smtplib.SMTP_SSL('${host}', ${port}) as server:
    server.login('${user}', '${pass}')
    server.sendmail('${from}', ['${to}'], msg.as_string())
    print("Sent successfully")`;
    }
  }

  const inputs = [hostInput, portInput, userInput, passInput, fromInput, toInput];
  inputs.forEach(inp => {
    if (inp) inp.addEventListener('input', update);
  });

  update();
}

/* ==========================================================================
   Clipboard Helper
   ========================================================================== */
function initClipboardButtons() {
  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const text = targetEl.textContent || targetEl.innerText;
        navigator.clipboard.writeText(text).then(() => {
          showToast('คัดลอกลง Clipboard เรียบร้อยแล้ว!');
        }).catch(err => {
          console.error('Clipboard copy failed:', err);
          showToast('ไม่สามารถคัดลอกได้', 'error');
        });
      }
    });
  });
}
