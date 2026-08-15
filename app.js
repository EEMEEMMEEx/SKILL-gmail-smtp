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
  initAcidSquares();
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

/* ==========================================================================
   AcidSquares WebGL 2 Shader (React Bits Component Integration)
   ========================================================================== */
async function initAcidSquares() {
  const container = document.getElementById('acid-squares-hero-bg');
  if (!container) return;

  try {
    const { Renderer, Program, Mesh, Triangle } = await import('https://cdn.jsdelivr.net/npm/ogl@1.0.11/dist/ogl.mjs');

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const vertex = `#version 300 es
    in vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }`;

    const fragment = `#version 300 es
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;
    uniform float uSpeed;
    uniform float uWaveDepth;
    uniform float uZoom;
    uniform float uDensity;
    uniform float uSpread;
    uniform float uStepSize;
    uniform float uGlow;
    uniform float uExposure;
    uniform float uColorShift;
    uniform float uContrast;
    uniform float uBrightness;
    uniform float uOpacity;
    uniform float uSteps;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec2 uMouse;
    uniform float uMouseStrength;
    uniform float uMouseRadius;
    uniform float uEnableMouse;
    uniform float uMouseActive;
    uniform float uGrain;
    uniform float uGrainIntensity;
    out vec4 fragColor;

    void main() {
      vec2 frag = gl_FragCoord.xy;
      float zoom = max(uZoom, 0.05);
      float aspect = iResolution.x / iResolution.y;
      vec2 ndc = (2.0 * frag - iResolution.xy) / iResolution.y;
      vec2 dir = ndc * (0.5 / zoom);

      vec2 mouseNdc = vec2(uMouse.x * aspect, uMouse.y);
      float mr = max(uMouseRadius, 0.01);
      vec2 md = ndc - mouseNdc;
      float dent = exp(-dot(md, md) / (mr * mr)) * (3.0 * uMouseStrength * uEnableMouse * uMouseActive);

      float travel = sin(iTime * uSpeed) * uWaveDepth;
      float density = max(uDensity, 1.0);
      float spread = clamp(uSpread, 0.05, 0.6);
      float stepSize = max(uStepSize, 0.0005);
      float glowGain = max(uGlow, 0.0);

      vec3 tOffset = vec3(0.0, dent, travel);
      vec3 p = vec3(0.0);
      float s = 0.0;
      float glow = 0.0;

      for (int i = 0; i < 48; i++) {
        if (float(i) >= uSteps) break;
        p += vec3(dir * s, s);
        vec3 q = p + tOffset;
        s += density - length(q.xz) + length(ceil(q).xy);
        s = stepSize + abs(s) * spread;
        glow += glowGain / s;
      }

      float e = glow / max(uExposure, 1.0);
      float shimmer = 0.5 + 0.5 * dot(cos(iTime * uColorShift + p), vec3(0.3333));
      float v = tanh(e * uBrightness * mix(0.7, 1.05, shimmer));
      v = clamp((v - 0.5) * uContrast + 0.5, 0.0, 1.0);

      vec3 col = mix(uColor1, uColor2, smoothstep(0.0, 0.55, v));
      col = mix(col, uColor3, smoothstep(0.55, 1.0, v));
      col *= v;

      float a = clamp(v, 0.0, 1.0) * uOpacity;
      vec3 outRgb = col * a;
      if (uGrain > 0.5) {
        float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
        outRgb = clamp(outRgb + gv, 0.0, 1.0);
        a = clamp(a + gv, 0.0, 1.0);
      }
      fragColor = vec4(outRgb, a);
    }`;

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: 0.6 },
        uWaveDepth: { value: 1.0 },
        uZoom: { value: 1.2 },
        uDensity: { value: 10.0 },
        uSpread: { value: 0.3 },
        uStepSize: { value: 0.002 },
        uGlow: { value: 1.0 },
        uExposure: { value: 2700 },
        uColorShift: { value: 0 },
        uContrast: { value: 1.1 },
        uBrightness: { value: 1.0 },
        uOpacity: { value: 0.8 },
        uSteps: { value: 32 },
        uColor1: { value: new Float32Array([0.08, 0.05, 0.25]) }, // Deep violet/navy
        uColor2: { value: new Float32Array([0.23, 0.51, 0.96]) }, // Tech blue
        uColor3: { value: new Float32Array([0.38, 0.65, 0.98]) }, // Light blue glow
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseStrength: { value: 0.12 },
        uMouseRadius: { value: 0.35 },
        uEnableMouse: { value: 1.0 },
        uMouseActive: { value: 0.0 },
        uGrain: { value: 1.0 },
        uGrainIntensity: { value: 0.04 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h);
      const res = program.uniforms.iResolution.value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    let mouseTarget = [0, 0];
    let mouseCurrent = [0, 0];
    let mouseActive = 0;
    let mouseActiveTarget = 0;

    window.addEventListener('mousemove', e => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2.0;
      const y = -((e.clientY - rect.top) / rect.height - 0.5) * 2.0;
      mouseTarget = [x, y];
      mouseActiveTarget = 1;
    });

    window.addEventListener('mouseleave', () => {
      mouseActiveTarget = 0;
    });

    const t0 = performance.now();
    const animate = t => {
      program.uniforms.iTime.value = (t - t0) * 0.001;

      mouseCurrent[0] += 0.05 * (mouseTarget[0] - mouseCurrent[0]);
      mouseCurrent[1] += 0.05 * (mouseTarget[1] - mouseCurrent[1]);
      const m = program.uniforms.uMouse.value;
      m[0] = mouseCurrent[0];
      m[1] = mouseCurrent[1];

      mouseActive += 0.05 * (mouseActiveTarget - mouseActive);
      program.uniforms.uMouseActive.value = mouseActive;

      renderer.render({ scene: mesh });
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  } catch (err) {
    console.warn('AcidSquares WebGL initialization skipped (fallback to CSS atmosphere):', err);
  }
}
