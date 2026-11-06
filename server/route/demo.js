// const express = require("express");
// const nodemailer = require("nodemailer");
// const DemoRequest = require("../models/DemoRequest");

// const router = express.Router();

// // --- NODEMAILER SETUP ---
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT || 587),
//   secure: process.env.SMTP_SECURE === "true",
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// // Helper to prevent HTML injection
// function escapeHtml(str = "") {
//   return String(str)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");
// }

// // ==========================================
// // ROUTES
// // ==========================================

// // 1. TEST EMAIL ROUTE (GET)
// router.get("/test-email", async (req, res) => {
//   console.log("📧 [Test Route] Initiating test email...");
//   try {
//     await transporter.verify();
//     console.log("✅ [Test Route] SMTP connection verified successfully.");

//     await transporter.sendMail({
//       from: process.env.SMTP_FROM,
//       to: process.env.NOTIFY_EMAIL,
//       subject: "React SMTP Test - It Works!",
//       html: "<h2>Success!</h2><p>Your backend can send emails.</p>",
//     });
    
//     console.log("✅ [Test Route] Test email sent to:", process.env.NOTIFY_EMAIL);
//     res.json({ success: true, message: "Test email sent successfully!" });
//   } catch (error) {
//     console.error("❌ [Test Route] SMTP Test Failed:", error.message);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // 2. MAIN FORM SUBMISSION ROUTE (POST)
// router.post("/demo-request", async (req, res) => {
//   console.log("📥 [Form Route] Received new demo request.");
//   try {
//     const { name, company, designation, phone, email, projectSize, notes } = req.body;

//     // Validation
//     if (!name || !company || !designation || !phone || !email || !projectSize) {
//       console.log("⚠️ [Form Route] Validation failed: Missing required fields.");
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // 1. Save to MongoDB
//     const savedRequest = await DemoRequest.create({
//       name, company, designation, phone, email, projectSize, notes
//     });
//     console.log("💾 [Form Route] Data saved to MongoDB. ID:", savedRequest._id);

//     // 2. Send Emails
//     try {
//       // --- ADMIN EMAIL TEMPLATE ---
//       console.log("📤 [Form Route] Sending Admin notification email...");
      
//       await transporter.sendMail({
//         from: process.env.SMTP_FROM,
//         to: process.env.NOTIFY_EMAIL,
//         replyTo: email, // If you hit "Reply", it replies to the user
//         subject: `New Demo Request — ${company} (${name})`,
//         html: `
//           <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; padding: 40px 20px; color: #333;">
//             <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              
//               <!-- Header -->
//               <div style="background-color: #111827; padding: 24px; text-align: center;">
//                 <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 500;">New Demo Request</h1>
//               </div>

//               <!-- Body -->
//               <div style="padding: 32px;">
//                 <p style="margin-top: 0; font-size: 16px; color: #555;">You have received a new demo request from your website.</p>
                
//                 <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
//                   <tr>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; width: 120px; color: #888; font-size: 14px;">Name</td>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-weight: 600; font-size: 15px;">${escapeHtml(name)}</td>
//                   </tr>
//                   <tr>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #888; font-size: 14px;">Company</td>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-weight: 600; font-size: 15px;">${escapeHtml(company)}</td>
//                   </tr>
//                   <tr>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #888; font-size: 14px;">Designation</td>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-size: 15px;">${escapeHtml(designation)}</td>
//                   </tr>
//                   <tr>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #888; font-size: 14px;">Phone</td>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-size: 15px;">${escapeHtml(phone)}</td>
//                   </tr>
//                   <tr>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #888; font-size: 14px;">Email</td>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-size: 15px;"><a href="mailto:${escapeHtml(email)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(email)}</a></td>
//                   </tr>
//                   <tr>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #888; font-size: 14px;">Project Size</td>
//                     <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-size: 15px;">${escapeHtml(projectSize)}</td>
//                   </tr>
//                 </table>

//                 <div style="margin-top: 24px;">
//                   <p style="margin-bottom: 8px; color: #888; font-size: 14px;">Additional Notes:</p>
//                   <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; font-size: 15px; color: #444; border: 1px solid #eeeeee;">
//                     ${notes ? escapeHtml(notes).replace(/\n/g, '<br>') : '<i>No additional notes provided.</i>'}
//                   </div>
//                 </div>
//               </div>

//               <!-- Footer -->
//               <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #eeeeee;">
//                 <p style="margin: 0; font-size: 12px; color: #999;">Demo Request ID: ${savedRequest._id}</p>
//               </div>
//             </div>
//           </div>
//         `,
//       });
//       console.log("✅ [Form Route] Admin notification sent.");

//       // --- USER EMAIL TEMPLATE ---
//       console.log("📤 [Form Route] Sending User confirmation email...");
      
//       await transporter.sendMail({
//         from: process.env.SMTP_FROM,
//         to: email,
//         subject: `We received your demo request for ${company}`,
//         html: `
//           <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; padding: 40px 20px; color: #333;">
//             <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              
//               <div style="padding: 40px 32px;">
//                 <h2 style="margin-top: 0; color: #111827; font-size: 24px;">Hi ${escapeHtml(name)},</h2>
                
//                 <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-top: 16px;">
//                   Thank you for requesting a personalized demo for <strong>${escapeHtml(company)}</strong>. We've received your details and our team is excited to show you what we can do.
//                 </p>

//                 <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
//                   One of our product specialists will reach out to you at <strong>${escapeHtml(email)}</strong> or <strong>${escapeHtml(phone)}</strong> within one working day to schedule a time that works best for you.
//                 </p>

//                 <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eeeeee;">
//                   <p style="font-size: 15px; color: #4b5563; margin-bottom: 4px;">Best regards,</p>
//                   <p style="font-size: 16px; font-weight: 600; color: #111827; margin-top: 0;">The Builder Demo Team</p>
//                 </div>
//               </div>

//               <div style="background-color: #111827; padding: 20px; text-align: center;">
//                 <p style="margin: 0; font-size: 13px; color: #9ca3af;">
//                   If you didn't request this, you can safely ignore this email.
//                 </p>
//               </div>
              
//             </div>
//           </div>
//         `,
//       });
//       console.log("✅ [Form Route] User confirmation sent to:", email);
      
//     } catch (mailErr) {
//       console.error("⚠️ [Form Route] Email sending failed, but data saved to DB:", mailErr.message);
//     }

//     console.log("🎉 [Form Route] Process complete.");
//     return res.status(200).json({ success: true, id: savedRequest._id });
    
//   } catch (err) {
//     console.error("❌ [Form Route] Server Error:", err.message);
//     return res.status(500).json({ error: "Something went wrong." });
//   }
// });

// module.exports = router;

const express = require("express");
const nodemailer = require("nodemailer");
const DemoRequest = require("../models/DemoRequest");

const router = express.Router();

// --- NODEMAILER SETUP ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper to prevent HTML injection
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ==========================================
// ROUTES
// ==========================================

// 1. TEST EMAIL ROUTE (GET)
router.get("/test-email", async (req, res) => {
  console.log("📧 [Test Route] Initiating test email...");
  try {
    await transporter.verify();
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.NOTIFY_EMAIL,
      subject: "React SMTP Test - It Works!",
      html: "<h2>Success!</h2><p>Your backend can send emails.</p>",
    });
    console.log("✅ [Test Route] Test email sent to:", process.env.NOTIFY_EMAIL);
    res.json({ success: true, message: "Test email sent successfully!" });
  } catch (error) {
    console.error("❌ [Test Route] SMTP Test Failed:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. MAIN FORM SUBMISSION ROUTE (POST)
router.post("/demo-request", async (req, res) => {
  console.log("📥 [Form Route] Received new demo request.");
  try {
    const { name, company, designation, phone, email, projectSize, notes } = req.body;

    // Validation
    if (!name || !company || !designation || !phone || !email || !projectSize) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Save to MongoDB
    const savedRequest = await DemoRequest.create({
      name, company, designation, phone, email, projectSize, notes
    });
    console.log("💾 [Form Route] Data saved to MongoDB. ID:", savedRequest._id);

    // 2. Send Emails
    try {
      // --- ADMIN EMAIL TEMPLATE (3D Glass UI) ---
      console.log("📤 [Form Route] Sending Admin notification email...");
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.NOTIFY_EMAIL,
        replyTo: email,
        subject: `New Demo Request — ${company} (${name})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: linear-gradient(135deg, #f4f5f7 0%, #e2e8f0 100%); padding: 40px 20px; min-height: 100vh;">
            
            <!-- 3D Glass Card Container -->
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), 0 0 1px 1px rgba(0,0,0,0.05);">
              
              <!-- 3D Gradient Header -->
              <div style="background: linear-gradient(135deg, #4F7DAD 0%, #1C2C35 100%); padding: 40px 32px; text-align: center; position: relative;">
                <div style="display: inline-block; padding: 8px 16px; background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 99px; color: #a5c9e8; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);">
                  Action Required
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">New Demo Request</h1>
              </div>

              <!-- Body -->
              <div style="padding: 40px;">
                <p style="margin-top: 0; font-size: 16px; color: #555; line-height: 1.5;">You have received a new request from your website.</p>
                
                <!-- 3D Data Table -->
                <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin-top: 32px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px dashed #cbd5e1; width: 120px; color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Name</td>
                      <td style="padding: 12px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 600; font-size: 15px; color: #1e293b;">${escapeHtml(name)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px dashed #cbd5e1; color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Company</td>
                      <td style="padding: 12px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 600; font-size: 15px; color: #1e293b;">${escapeHtml(company)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px dashed #cbd5e1; color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Role</td>
                      <td style="padding: 12px 0; border-bottom: 1px dashed #cbd5e1; font-size: 15px; color: #334155;">${escapeHtml(designation)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px dashed #cbd5e1; color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Phone</td>
                      <td style="padding: 12px 0; border-bottom: 1px dashed #cbd5e1; font-size: 15px; color: #334155;">${escapeHtml(phone)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px dashed #cbd5e1; color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Email</td>
                      <td style="padding: 12px 0; border-bottom: 1px dashed #cbd5e1; font-size: 15px;"><a href="mailto:${escapeHtml(email)}" style="color: #4F7DAD; text-decoration: none; font-weight: 500;">${escapeHtml(email)}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Project</td>
                      <td style="padding: 12px 0; font-size: 15px; color: #334155;">${escapeHtml(projectSize)}</td>
                    </tr>
                  </table>
                </div>

                <div style="margin-top: 24px;">
                  <p style="margin-bottom: 8px; color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Notes:</p>
                  <div style="background-color: #f8fafc; padding: 16px 20px; border-radius: 12px; font-size: 15px; color: #334155; border: 1px solid #e2e8f0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); line-height: 1.5;">
                    ${notes ? escapeHtml(notes).replace(/\n/g, '<br>') : '<i>No additional notes provided.</i>'}
                  </div>
                </div>

                <!-- 3D Action Button -->
                <div style="margin-top: 32px; text-align: center;">
                  <a href="mailto:${escapeHtml(email)}" style="display: inline-block; background: linear-gradient(180deg, #4F7DAD 0%, #3B628B 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(79, 125, 173, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);">
                    Reply to ${escapeHtml(name.split(' ')[0])}
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #ffffff; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">Request ID: ${savedRequest._id}</p>
              </div>
            </div>
          </div>
        `,
      });
      console.log("✅ [Form Route] Admin notification sent.");

      // --- USER EMAIL TEMPLATE (3D Glass UI) ---
      console.log("📤 [Form Route] Sending User confirmation email...");
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: `We received your demo request for ${company}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: linear-gradient(135deg, #f4f5f7 0%, #e2e8f0 100%); padding: 40px 20px; min-height: 100vh;">
            
            <!-- 3D Glass Card Container -->
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), 0 0 1px 1px rgba(0,0,0,0.05);">
              
              <!-- 3D Gradient Header -->
              <div style="background: linear-gradient(135deg, #1C2C35 0%, #4F7DAD 100%); padding: 48px 32px; text-align: center;">
                <div style="display: inline-block; padding: 8px 16px; background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 99px; color: #ffffff; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);">
                  Request Confirmed
                </div>
                <h2 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">You're all set, ${escapeHtml(name.split(' ')[0])}!</h2>
              </div>

              <!-- Body -->
              <div style="padding: 40px 32px;">
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-top: 0;">
                  Thank you for requesting a personalized demo for <strong style="color: #1e293b;">${escapeHtml(company)}</strong>. We've received your details and our team is excited to show you what we can do.
                </p>

                <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 32px 0; border: 1px solid #e2e8f0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.05);">
                  <p style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 500;">
                    What happens next?
                  </p>
                  <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #475569;">
                    One of our product specialists will reach out to you at <strong style="color: #1e293b;">${escapeHtml(email)}</strong> or <strong style="color: #1e293b;">${escapeHtml(phone)}</strong> within one working day to schedule a time that works best for you.
                  </p>
                </div>

                <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                  In the meantime, feel free to explore more about how SpaceScanner is changing digital handovers.
                </p>

                <div style="margin-top: 32px; text-align: center;">
                  <a href="https://spacescanner.com" style="display: inline-block; background: linear-gradient(180deg, #1C2C35 0%, #111827 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(28, 44, 53, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);">
                    Explore SpaceScanner
                  </a>
                </div>

                <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 15px; color: #475569; margin-bottom: 4px;">Best regards,</p>
                  <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin-top: 0;">The SpaceScanner Team</p>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                  If you didn't request this, you can safely ignore this email.
                </p>
              </div>
              
            </div>
          </div>
        `,
      });
      console.log("✅ [Form Route] User confirmation sent to:", email);
      
    } catch (mailErr) {
      console.error("⚠️ [Form Route] Email sending failed, but data saved to DB:", mailErr.message);
    }

    console.log("🎉 [Form Route] Process complete.");
    return res.status(200).json({ success: true, id: savedRequest._id });
    
  } catch (err) {
    console.error("❌ [Form Route] Server Error:", err.message);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;