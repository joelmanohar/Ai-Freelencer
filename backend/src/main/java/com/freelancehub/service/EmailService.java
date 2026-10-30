package com.freelancehub.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.notifications.admin-email:}")
    private String adminEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Routes demo or missing account addresses to the configured admin notification address.
     */
    private String resolveRecipient(String email) {
        if (email == null || email.isBlank() || email.endsWith("@demo.com") || email.endsWith("@example.com") || !email.contains("@")) {
            return hasText(adminEmail) ? adminEmail : null;
        }
        return email;
    }

    private boolean isSmtpConfigured() {
        return hasText(senderEmail) && hasText(mailPassword);
    }

    public boolean isConfigured() {
        return isSmtpConfigured() && hasText(adminEmail);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    /**
     * 1. PAYMENT CONFIRMATION TO CLIENT
     */
    public void sendPaymentSuccessEmailToClient(String toEmail, String clientName, String freelancerName,
                                               String projectTitle, Double amount, String currency,
                                               String paymentId, String orderId) {
        if (!isSmtpConfigured()) return;
        String target = resolveRecipient(toEmail);
        if (!hasText(target)) return;
        CompletableFuture.runAsync(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(senderEmail, "FreelanceHub Payments");
                helper.setTo(target);

                String ref = orderId != null ? orderId : paymentId;
                helper.setSubject("FreelanceHub Payment Confirmation - Order #" + ref + " - " + projectTitle);

                String formattedAmount = String.format("%.2f", amount != null ? amount : 0.0);
                String curr = currency != null ? currency : "INR";

                String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b; margin: 0;">
                        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 28px; text-align: center; color: white;">
                                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Payment Successful ✅</h1>
                                <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Receipt for Order #%s</p>
                            </div>
                            <div style="padding: 28px;">
                                <p style="font-size: 15px; margin-top: 0;">Dear <strong>%s</strong>,</p>
                                <p style="font-size: 14px; color: #475569; line-height: 1.5;">Your payment for project <strong>%s</strong> was completed successfully.</p>

                                <table style="width: 100%%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px; overflow: hidden;">
                                    <tr><td style="padding: 12px 16px; color: #64748b; font-size: 13px; border-bottom: 1px solid #e2e8f0;">Project</td><td style="padding: 12px 16px; font-weight: 600; text-align: right; font-size: 13px; border-bottom: 1px solid #e2e8f0;">%s</td></tr>
                                    <tr><td style="padding: 12px 16px; color: #64748b; font-size: 13px; border-bottom: 1px solid #e2e8f0;">Freelancer</td><td style="padding: 12px 16px; font-weight: 600; text-align: right; font-size: 13px; border-bottom: 1px solid #e2e8f0;">%s</td></tr>
                                    <tr><td style="padding: 12px 16px; color: #64748b; font-size: 13px; border-bottom: 1px solid #e2e8f0;">Payment ID</td><td style="padding: 12px 16px; font-family: monospace; font-size: 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">%s</td></tr>
                                    <tr><td style="padding: 12px 16px; color: #64748b; font-size: 13px; border-bottom: 1px solid #e2e8f0;">Order ID</td><td style="padding: 12px 16px; font-family: monospace; font-size: 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">%s</td></tr>
                                    <tr style="background: #eff6ff;"><td style="padding: 14px 16px; font-size: 15px; font-weight: 700; color: #1e40af;">Total Paid</td><td style="padding: 14px 16px; font-size: 16px; font-weight: 700; color: #1e40af; text-align: right;">%s %s</td></tr>
                                </table>

                                <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">Milestone funds have been transferred to the freelancer. The project status is now marked as <strong>Completed</strong>.</p>
                            </div>
                            <div style="background: #f1f5f9; padding: 14px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                                FreelanceHub Automated Notifications
                            </div>
                        </div>
                    </body>
                    </html>
                    """.formatted(
                        ref,
                        clientName != null ? clientName : "Client",
                        projectTitle,
                        projectTitle,
                        freelancerName != null ? freelancerName : "Freelancer",
                        paymentId,
                        orderId != null ? orderId : "N/A",
                        curr,
                        formattedAmount
                );

                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("Payment confirmation email successfully sent to: {}", target);
            } catch (Exception e) {
                logger.error("Failed to send payment confirmation email: {}", e.getMessage(), e);
            }
        });
    }

    /**
     * 2. PAYMENT RECEIVED NOTIFICATION TO FREELANCER
     */
    public void sendPaymentReceivedEmailToFreelancer(String toEmail, String freelancerName, String clientName,
                                                    String projectTitle, Double amount, String currency,
                                                    String paymentId) {
        if (!isSmtpConfigured()) return;
        String target = resolveRecipient(toEmail);
        if (!hasText(target)) return;
        CompletableFuture.runAsync(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(senderEmail, "FreelanceHub Payments");
                helper.setTo(target);
                helper.setSubject("FreelanceHub Funds Released - " + projectTitle);

                String formattedAmount = String.format("%.2f", amount != null ? amount : 0.0);
                String curr = currency != null ? currency : "INR";

                String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b; margin: 0;">
                        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 28px; text-align: center; color: white;">
                                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Payment Released! 💰</h1>
                                <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Funds received for %s</p>
                            </div>
                            <div style="padding: 28px;">
                                <p style="font-size: 15px; margin-top: 0;">Dear <strong>%s</strong>,</p>
                                <p style="font-size: 14px; color: #475569; line-height: 1.5;">Client <strong>%s</strong> has released milestone funds for your completed project:</p>

                                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center;">
                                    <div style="font-size: 12px; color: #047857; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Amount Deposited</div>
                                    <div style="font-size: 26px; font-weight: 800; color: #065f46; margin: 4px 0;">%s %s</div>
                                    <div style="font-size: 12px; color: #059669; font-family: monospace;">Ref: %s</div>
                                </div>

                                <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">The project has officially wrapped up. Thank you for using FreelanceHub!</p>
                            </div>
                            <div style="background: #f1f5f9; padding: 14px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                                FreelanceHub Automated Notifications
                            </div>
                        </div>
                    </body>
                    </html>
                    """.formatted(
                        projectTitle,
                        freelancerName != null ? freelancerName : "Freelancer",
                        clientName != null ? clientName : "Client",
                        curr,
                        formattedAmount,
                        paymentId
                );

                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("Freelancer payment release email successfully sent to: {}", target);
            } catch (Exception e) {
                logger.error("Failed to send freelancer payment email: {}", e.getMessage(), e);
            }
        });
    }

    /**
     * 3. PAYMENT NOTIFICATION TO THE CONFIGURED ADMIN ADDRESS
     */
    public void sendAdminPaymentNotification(String projectTitle, String clientName, String freelancerName,
                                            Double amount, String currency, String paymentId, String orderId) {
        if (!isConfigured()) return;
        CompletableFuture.runAsync(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(senderEmail, "FreelanceHub System");
                helper.setTo(adminEmail);
                helper.setSubject("FreelanceHub Alert: Payment Received for " + projectTitle);

                String formattedAmount = String.format("%.2f", amount != null ? amount : 0.0);
                String curr = currency != null ? currency : "INR";

                String htmlContent = """
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
                        <h2 style="color: #2563eb;">Payment Received Notice</h2>
                        <p>A new payment transaction has completed on FreelanceHub.</p>
                        <ul>
                            <li><strong>Project:</strong> %s</li>
                            <li><strong>Client:</strong> %s</li>
                            <li><strong>Freelancer:</strong> %s</li>
                            <li><strong>Amount:</strong> %s %s</li>
                            <li><strong>Payment ID:</strong> %s</li>
                            <li><strong>Order ID:</strong> %s</li>
                        </ul>
                    </div>
                    """.formatted(projectTitle, clientName, freelancerName, curr, formattedAmount, paymentId, orderId != null ? orderId : "N/A");

                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("Admin payment notification email sent to {}", senderEmail);
            } catch (Exception e) {
                logger.error("Failed to send admin payment notification email: {}", e.getMessage(), e);
            }
        });
    }

    /**
     * 4. PROPOSAL ACCEPTED EMAIL TO FREELANCER
     */
    public void sendProposalAcceptedEmailToFreelancer(String toEmail, String freelancerName, String clientName,
                                                     String projectTitle, Double budget) {
        if (!isSmtpConfigured()) return;
        String target = resolveRecipient(toEmail);
        if (!hasText(target)) return;
        CompletableFuture.runAsync(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(senderEmail, "FreelanceHub Proposals");
                helper.setTo(target);
                helper.setSubject("🎉 Congratulations! Your Proposal was Accepted: " + projectTitle);

                String formattedBudget = budget != null ? String.format("%.2f", budget) : "Agreed Amount";

                String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b; margin: 0;">
                        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 28px; text-align: center; color: white;">
                                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Proposal Accepted! 🚀</h1>
                                <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">You have been hired for %s</p>
                            </div>
                            <div style="padding: 28px;">
                                <p style="font-size: 15px; margin-top: 0;">Dear <strong>%s</strong>,</p>
                                <p style="font-size: 14px; color: #475569; line-height: 1.5;">Great news! Client <strong>%s</strong> has reviewed your proposal and hired you for the project:</p>

                                <div style="background: #f1f5f9; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                                    <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">%s</h3>
                                    <p style="margin: 0; color: #059669; font-weight: 700; font-size: 16px;">Bid Amount: INR %s</p>
                                </div>

                                <p style="font-size: 14px; color: #475569; line-height: 1.5;">The project is now <strong>In Progress</strong>. You can now access your project workspace to chat directly with the client, share files, and track deliverables.</p>
                            </div>
                            <div style="background: #f1f5f9; padding: 14px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                                FreelanceHub Automated Notifications
                            </div>
                        </div>
                    </body>
                    </html>
                    """.formatted(
                        projectTitle,
                        freelancerName != null ? freelancerName : "Freelancer",
                        clientName != null ? clientName : "Client",
                        projectTitle,
                        formattedBudget
                );

                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("Proposal accepted email sent to freelancer: {}", target);
            } catch (Exception e) {
                logger.error("Failed to send proposal accepted email to freelancer: {}", e.getMessage(), e);
            }
        });
    }

    /**
     * 5. PROPOSAL ACCEPTED CONFIRMATION TO CLIENT
     */
    public void sendProposalAcceptedEmailToClient(String toEmail, String clientName, String freelancerName,
                                                 String projectTitle, Double budget) {
        if (!isSmtpConfigured()) return;
        String target = resolveRecipient(toEmail);
        if (!hasText(target)) return;
        CompletableFuture.runAsync(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(senderEmail, "FreelanceHub Proposals");
                helper.setTo(target);
                helper.setSubject("FreelanceHub - You Hired " + freelancerName + " for: " + projectTitle);

                String formattedBudget = budget != null ? String.format("%.2f", budget) : "Agreed Amount";

                String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b; margin: 0;">
                        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 28px; text-align: center; color: white;">
                                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Freelancer Hired! 🤝</h1>
                            </div>
                            <div style="padding: 28px;">
                                <p style="font-size: 15px; margin-top: 0;">Dear <strong>%s</strong>,</p>
                                <p style="font-size: 14px; color: #475569; line-height: 1.5;">You have accepted the proposal from <strong>%s</strong> for project <strong>%s</strong>.</p>
                                <div style="background: #f1f5f9; padding: 14px 18px; border-radius: 8px; margin: 16px 0; border: 1px solid #e2e8f0;">
                                    <p style="margin: 0; font-size: 14px; color: #1e293b;">Agreed Amount: <strong>INR %s</strong></p>
                                </div>
                                <p style="font-size: 14px; color: #475569; line-height: 1.5;">You can now open the project workspace to collaborate and exchange messages.</p>
                            </div>
                            <div style="background: #f1f5f9; padding: 14px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                                FreelanceHub Automated Notifications
                            </div>
                        </div>
                    </body>
                    </html>
                    """.formatted(
                        clientName != null ? clientName : "Client",
                        freelancerName != null ? freelancerName : "Freelancer",
                        projectTitle,
                        formattedBudget
                );

                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("Proposal accepted email sent to client: {}", target);
            } catch (Exception e) {
                logger.error("Failed to send proposal accepted email to client: {}", e.getMessage(), e);
            }
        });
    }

    /**
     * 6. PROPOSAL ACCEPTED NOTIFICATION TO THE CONFIGURED ADMIN ADDRESS
     */
    public void sendAdminProposalAcceptedNotification(String projectTitle, String clientName,
                                                     String freelancerName, Double budget) {
        if (!isConfigured()) return;
        CompletableFuture.runAsync(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(senderEmail, "FreelanceHub System");
                helper.setTo(adminEmail);
                helper.setSubject("FreelanceHub Alert: Proposal Accepted for " + projectTitle);

                String formattedBudget = budget != null ? String.format("%.2f", budget) : "Agreed Amount";

                String htmlContent = """
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
                        <h2 style="color: #059669;">Proposal Accepted Notice</h2>
                        <p>A client has accepted a freelancer's proposal.</p>
                        <ul>
                            <li><strong>Project:</strong> %s</li>
                            <li><strong>Client:</strong> %s</li>
                            <li><strong>Freelancer:</strong> %s</li>
                            <li><strong>Agreed Budget:</strong> INR %s</li>
                        </ul>
                    </div>
                    """.formatted(projectTitle, clientName, freelancerName, formattedBudget);

                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("Admin proposal notification sent to {}", senderEmail);
            } catch (Exception e) {
                logger.error("Failed to send admin proposal notification: {}", e.getMessage(), e);
            }
        });
    }
}
