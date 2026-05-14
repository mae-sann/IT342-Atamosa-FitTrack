package com.fittrack.user;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender, @Value("${app.mail.from}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    // Sends the post-registration onboarding email after a user account is created.
    public void sendWelcomeEmail(String toEmail, String firstName) {
        try {
            String htmlContent = loadWelcomeEmailTemplate(firstName);
            sendHtmlEmail(toEmail, "Welcome to FitTrack", htmlContent);
            LOGGER.info("Welcome email sent successfully to: {}", toEmail);
        } catch (Exception ex) {
            LOGGER.error("Failed to send welcome email to {}: {}", toEmail, ex.getMessage());
            throw new RuntimeException("Email sending failed: " + ex.getMessage(), ex);
        }
    }

    // Sends a lightweight notification after the API persists a workout entry.
    public void sendWorkoutSavedEmail(String toEmail, String firstName) {
        try {
            String htmlContent = loadWorkoutSavedEmailTemplate(firstName);
            sendHtmlEmail(toEmail, "🏋️ Workout Saved - Great Job!", htmlContent);
            LOGGER.info("Workout saved email sent successfully to: {}", toEmail);
        } catch (Exception ex) {
            LOGGER.error("Failed to send workout saved email to {}: {}", toEmail, ex.getMessage());
            throw new RuntimeException("Email sending failed: " + ex.getMessage(), ex);
        }
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

        helper.setFrom(fromAddress);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    private String loadWelcomeEmailTemplate(String firstName) {
        try (InputStream is = getClass().getResourceAsStream("/templates/welcome-email.html")) {
            if (is == null) {
                throw new RuntimeException("Welcome email template not found");
            }
            String htmlContent = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return htmlContent.replace("[[firstName]]", firstName != null ? firstName : "Friend");
        } catch (Exception ex) {
            LOGGER.error("Error loading welcome email template: {}", ex.getMessage());
            throw new RuntimeException("Failed to load email template", ex);
        }
    }

    private String loadWorkoutSavedEmailTemplate(String firstName) {
        String htmlContent = "<!DOCTYPE html>\n" +
            "<html lang=\"en\">\n" +
            "<head>\n" +
            "    <meta charset=\"UTF-8\">\n" +
            "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
            "    <title>Workout Saved</title>\n" +
            "</head>\n" +
            "<body style=\"margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #1f2937;\">\n" +
            "    <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #f3f4f6;\">\n" +
            "        <tr>\n" +
            "            <td style=\"padding: 20px;\">\n" +
            "                <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\" style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\">\n" +
            "                    <tr>\n" +
            "                        <td style=\"background: linear-gradient(135deg, #2563EB 0%, #1e40af 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;\">\n" +
            "                            <div style=\"font-size: 36px; margin-bottom: 10px;\"></div>\n" +
            "                            <div style=\"font-size: 28px; font-weight: bold; color: #ffffff;\">Awesome Work!</div>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr>\n" +
            "                        <td style=\"padding: 40px 30px;\">\n" +
            "                            <div style=\"font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 20px;\">\n" +
            "                                Hi " + (firstName != null ? firstName : "Friend") + ",\n" +
            "                            </div>\n" +
            "                            <div style=\"font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 24px;\">\n" +
            "                                <p style=\"margin: 0 0 12px 0;\">🎉 Your workout has been successfully saved!</p>\n" +
            "                                <p style=\"margin: 0;\">Keep pushing your limits. Consistency is the key to achieving your fitness goals. Every workout brings you closer to the results you deserve!</p>\n" +
            "                            </div>\n" +
    
            "                            <div style=\"border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center;\">\n" +
            "                                © 2026 FitTrack. Keep training, keep winning!\n" +
            "                            </div>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                </table>\n" +
            "            </td>\n" +
            "        </tr>\n" +
            "    </table>\n" +
            "</body>\n" +
            "</html>";
        return htmlContent;
    }
}
