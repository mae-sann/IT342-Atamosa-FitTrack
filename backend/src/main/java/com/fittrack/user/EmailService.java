package com.fittrack.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender, @Value("${app.mail.from}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    // Sends the post-registration onboarding email after a user account is created.
    public void sendWelcomeEmail(String toEmail, String firstName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Welcome to FitTrack");
        message.setText("Hello " + firstName + ",\n\nYour FitTrack account has been successfully created.\n\nStart tracking your workouts today.");
        mailSender.send(message);
    }

    // Sends a lightweight notification after the API persists a workout entry.
    public void sendWorkoutSavedEmail(String toEmail, String firstName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Workout Saved");
        message.setText("Great job!\n\nYour workout has been successfully recorded.\n\nKeep pushing your limits.");
        mailSender.send(message);
    }
}
