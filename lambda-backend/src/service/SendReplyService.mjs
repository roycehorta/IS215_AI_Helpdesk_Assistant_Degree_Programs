// src/service/SendReplyService.mjs
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { ses } from "../client/SESClient.mjs";

const SENDER_EMAIL = process.env.SES_SENDER_EMAIL;
if (!SENDER_EMAIL)
  throw new Error("Missing environment variable: SES_SENDER_EMAIL");

export async function sendReply(toEmail, ticketId, replyText, studentName) {
  try {
    console.log("===========================================");
    console.log("         Sending Reply Email               ");
    console.log("===========================================");
    console.log("To        :", toEmail);
    console.log("Ticket ID :", ticketId);
    console.log("From      :", SENDER_EMAIL);
    console.log("===========================================");

    const subject = `Re: Your UPOU Helpdesk Ticket [${ticketId}]`;
    const firstName = studentName
      .split(/[@._]/)[0]
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- University Header -->
          <tr>
            <td style="background:#7b1113;padding:0;border-radius:12px 12px 0 0;overflow:hidden;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#5a0d0e;padding:12px 32px;text-align:center;">
                    <p style="color:rgba(255,255,255,0.9);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0;font-family:Arial,sans-serif;">University of the Philippines</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px 20px;text-align:center;">
                    <!-- UP Seal placeholder using text -->
                    <div style="display:inline-block;width:72px;height:72px;background:rgba(255,255,255,0.15);border-radius:50%;border:2px solid rgba(255,255,255,0.4);text-align:center;line-height:72px;margin-bottom:12px;overflow:hidden">
                      <img src="https://project.dsllenado.is215.upou.io/up.png" alt="UP Seal" style="width:72px;height:72px;vertical-align:top;display:block">
                    </div>
                    <p style="color:white;font-size:20px;font-weight:bold;margin:0;font-family:Georgia,serif;letter-spacing:0.5px;">UP Open University</p>
                    <p style="color:rgba(255,255,255,0.75);font-size:12px;margin:4px 0 0;font-family:Arial,sans-serif;letter-spacing:1px;">OFFICE OF THE HELPDESK</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#5a0d0e;padding:8px 32px;text-align:center;">
                    <p style="color:rgba(255,255,255,0.7);font-size:10px;margin:0;font-family:Arial,sans-serif;letter-spacing:1px;">DEGREE PROGRAMS INQUIRY SYSTEM</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ticket reference bar -->
          <tr>
            <td style="background:#f9f5f0;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;padding:12px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="color:#6b7280;font-size:11px;margin:0;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Ticket Reference</p>
                    <p style="color:#7b1113;font-size:14px;font-weight:bold;margin:2px 0 0;font-family:'Courier New',monospace;">${ticketId}</p>
                  </td>
                  <td align="right">
                    <span style="background:#7b1113;color:white;font-size:10px;padding:4px 12px;border-radius:20px;font-family:Arial,sans-serif;font-weight:bold;">UNOFFICIAL RESPONSE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:white;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <p style="color:#374151;font-size:15px;margin:0 0 6px;font-family:Georgia,serif;">Dear <strong>${firstName}</strong>,</p>
              <p style="color:#6b7280;font-size:13px;margin:0 0 24px;line-height:1.7;font-family:Arial,sans-serif;">
                Greetings from the UP Open University Helpdesk. We have carefully reviewed your inquiry and are pleased to provide the following response:
              </p>

              <!-- Reply content -->
              <div style="background:#fdfaf7;border:1px solid #e5e7eb;border-left:4px solid #7b1113;border-radius:0 8px 8px 0;padding:20px 24px;margin:0 0 28px;">
                <p style="color:#1f2937;font-size:14px;line-height:1.8;margin:0;white-space:pre-wrap;font-family:Arial,sans-serif;">${replyText}</p>
              </div>

              <p style="color:#6b7280;font-size:13px;line-height:1.7;margin:0 0 28px;font-family:Arial,sans-serif;">
                Should you have further questions or require additional assistance, we encourage you to reach out through any of our official communication channels listed below.
              </p>

              <!-- Divider with seal watermark text -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-top:1px solid #e5e7eb;"></td>
                  <td style="padding:0 12px;white-space:nowrap;">
                    <span style="color:#d1d5db;font-size:10px;font-family:Georgia,serif;">✦ UPOU ✦</span>
                  </td>
                  <td style="border-top:1px solid #e5e7eb;"></td>
                </tr>
              </table>

              <!-- Contact channels -->
              <p style="color:#374151;font-size:12px;font-weight:bold;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Official Contact Channels</p>
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td style="padding:5px 0;width:50%;">
                    <span style="font-size:13px;">🌐</span>
                    <a href="https://upou.edu.ph" style="color:#7b1113;font-size:13px;text-decoration:none;margin-left:6px;font-family:Arial,sans-serif;">upou.edu.ph</a>
                  </td>
                  <td style="padding:5px 0;">
                    <span style="font-size:13px;">📧</span>
                    <a href="mailto:info@upou.edu.ph" style="color:#7b1113;font-size:13px;text-decoration:none;margin-left:6px;font-family:Arial,sans-serif;">info@upou.edu.ph</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:5px 0;">
                    <span style="font-size:13px;">📘</span>
                    <a href="https://facebook.com/upouofficial" style="color:#7b1113;font-size:13px;text-decoration:none;margin-left:6px;font-family:Arial,sans-serif;">fb.com/upouofficial</a>
                  </td>
                  <td style="padding:5px 0;">
                    <span style="font-size:13px;">📞</span>
                    <span style="color:#6b7280;font-size:13px;margin-left:6px;font-family:Arial,sans-serif;">(049) 536-6011 to 15</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="background:#f9f5f0;padding:20px 32px;border:1px solid #e5e7eb;border-top:none;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-left:3px solid #7b1113;padding-left:12px;">
                    <p style="color:#374151;font-size:13px;font-weight:bold;margin:0;font-family:Georgia,serif;">UPOU Helpdesk Team</p>
                    <p style="color:#6b7280;font-size:12px;margin:2px 0;font-family:Arial,sans-serif;">Degree Programs Inquiry System</p>
                    <p style="color:#6b7280;font-size:12px;margin:2px 0;font-family:Arial,sans-serif;">
                      <a href="mailto:${SENDER_EMAIL}" style="color:#7b1113;text-decoration:none;">${SENDER_EMAIL}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#7b1113;padding:20px 32px;border-radius:0 0 12px 12px;text-align:center;">
              <p style="color:rgba(255,255,255,0.9);font-size:12px;font-weight:bold;margin:0 0 4px;font-family:Georgia,serif;">University of the Philippines Open University</p>
              <p style="color:rgba(255,255,255,0.6);font-size:11px;margin:0;font-family:Arial,sans-serif;">Los Baños, Laguna, Philippines 4031 · upou.edu.ph</p>
              <p style="color:rgba(255,255,255,0.4);font-size:10px;margin:12px 0 0;font-family:Arial,sans-serif;">This is an automated message from the UPOU Helpdesk System. Please do not reply directly to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

    const textBody = `
Dear ${firstName},

Thank you for reaching out to the UPOU Helpdesk. Here is our response to your inquiry:

${replyText}

If you have further questions, please contact us:
- Website: upou.edu.ph
- Email: info@upou.edu.ph
- Facebook: facebook.com/upouofficial
- Phone: (049) 536-6011 to 15

—
UPOU Helpdesk Team
${SENDER_EMAIL}
University of the Philippines Open University
Los Baños, Laguna, Philippines 4031
    `.trim();

    await ses.send(
      new SendEmailCommand({
        Source: `UPOU Helpdesk <${SENDER_EMAIL}>`,
        Destination: { ToAddresses: [toEmail] },
        Message: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: htmlBody, Charset: "UTF-8" },
            Text: { Data: textBody, Charset: "UTF-8" },
          },
        },
      }),
    );

    console.log("===========================================");
    console.log("       Reply Email Sent Successfully       ");
    console.log("===========================================");
    console.log("To        :", toEmail);
    console.log("Subject   :", subject);
    console.log("===========================================");

    return { success: true, message: "Reply sent successfully." };
  } catch (error) {
    console.error("Send Reply Error name    :", error.name);
    console.error("Send Reply Error message :", error.message);
    throw new Error("Failed to send reply email.");
  }
}
