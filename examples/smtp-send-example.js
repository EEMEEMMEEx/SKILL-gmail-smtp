/**
 * Reference Implementation: High-Deliverability Gmail SMTP Sender
 * Standards compliant: RFC 5321 (SMTP), RFC 5322 (Internet Message Format),
 * RFC 2047 (MIME Header Thai Encoding), RFC 2046 (Multipart/Alternative)
 */

import tls from 'node:tls';
import crypto from 'node:crypto';

/**
 * Encode Thai/UTF-8 string for email headers according to RFC 2047 (Base64)
 * @param {string} text - Plain text (e.g. Thai name or subject)
 * @returns {string} Encoded MIME header string
 */
function encodeRFC2047(text) {
  if (!text) return '';
  // Check if string contains non-ASCII characters
  if (/^[\x20-\x7E]*$/.test(text)) {
    return text;
  }
  const base64Str = Buffer.from(text, 'utf-8').toString('base64');
  return `=?UTF-8?B?${base64Str}?=`;
}

/**
 * Build RFC 5322 compliant message payload
 */
function buildMessage({ fromEmail, fromName, toEmail, subject, textContent, htmlContent }) {
  const boundary = `----=_Part_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const messageId = `<${crypto.randomUUID()}@smtp.gmail.com>`;
  const dateStr = new Date().toUTCString();

  const encodedFromName = encodeRFC2047(fromName || 'Notification System');
  const encodedSubject = encodeRFC2047(subject);

  const headers = [
    `Date: ${dateStr}`,
    `From: ${encodedFromName} <${fromEmail}>`,
    `To: <${toEmail}>`,
    `Message-ID: ${messageId}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];

  const textPart = [
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(textContent, 'utf-8').toString('base64'),
    ``,
  ].join('\r\n');

  const htmlPart = [
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(htmlContent, 'utf-8').toString('base64'),
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  return headers.join('\r\n') + '\r\n\r\n' + textPart + htmlPart;
}

/**
 * Send an email via native TLS Gmail SMTP (Port 465)
 */
export async function sendEmail({
  user,
  pass,
  fromEmail,
  fromName,
  toEmail,
  subject,
  textContent,
  htmlContent,
}) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: 'smtp.gmail.com',
      port: 465,
      servername: 'smtp.gmail.com',
    });

    let buffer = '';
    let step = 0;

    socket.setEncoding('utf-8');

    const sendCommand = (cmd) => {
      socket.write(cmd + '\r\n');
    };

    socket.on('data', (data) => {
      buffer += data;
      const lines = buffer.split('\r\n');
      buffer = lines.pop(); // Keep partial line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;
        const code = parseInt(line.substring(0, 3), 10);
        const isLastLine = line.charAt(3) === ' ' || line.length === 3;

        if (!isLastLine) continue; // Multi-line response (e.g. 250-...)

        if (code >= 400) {
          socket.destroy();
          return reject(new Error(`SMTP Error [${code}]: ${line}`));
        }

        switch (step) {
          case 0: // Greeting 220
            if (code === 220) {
              step = 1;
              sendCommand('EHLO localhost');
            }
            break;
          case 1: // EHLO 250
            if (code === 250) {
              step = 2;
              sendCommand('AUTH LOGIN');
            }
            break;
          case 2: // AUTH LOGIN -> Challenge 334 (Username)
            if (code === 334) {
              step = 3;
              sendCommand(Buffer.from(user).toString('base64'));
            }
            break;
          case 3: // Challenge 334 (Password)
            if (code === 334) {
              step = 4;
              sendCommand(Buffer.from(pass).toString('base64'));
            }
            break;
          case 4: // Auth Success 235
            if (code === 235) {
              step = 5;
              sendCommand(`MAIL FROM:<${fromEmail || user}>`);
            }
            break;
          case 5: // MAIL FROM 250
            if (code === 250) {
              step = 6;
              sendCommand(`RCPT TO:<${toEmail}>`);
            }
            break;
          case 6: // RCPT TO 250
            if (code === 250) {
              step = 7;
              sendCommand('DATA');
            }
            break;
          case 7: // DATA 354
            if (code === 354) {
              step = 8;
              const rawMessage = buildMessage({
                fromEmail: fromEmail || user,
                fromName,
                toEmail,
                subject,
                textContent,
                htmlContent,
              });
              socket.write(rawMessage + '\r\n.\r\n');
            }
            break;
          case 8: // DATA Completed 250
            if (code === 250) {
              step = 9;
              sendCommand('QUIT');
            }
            break;
          case 9: // QUIT 221
            socket.end();
            return resolve({ success: true, message: 'Message sent successfully' });
        }
      }
    });

    socket.on('error', (err) => {
      reject(err);
    });

    socket.setTimeout(15000, () => {
      socket.destroy();
      reject(new Error('SMTP Connection Timeout (15s)'));
    });
  });
}
