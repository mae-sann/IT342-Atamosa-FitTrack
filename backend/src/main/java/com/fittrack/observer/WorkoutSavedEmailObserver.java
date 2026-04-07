package com.fittrack.observer;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.fittrack.event.WorkoutSavedEvent;
import com.fittrack.service.EmailService;

@Component
public class WorkoutSavedEmailObserver {

    private final EmailService emailService;

    public WorkoutSavedEmailObserver(EmailService emailService) {
        this.emailService = emailService;
    }

    @EventListener
    public void onWorkoutSaved(WorkoutSavedEvent event) {
        try {
            emailService.sendWorkoutSavedEmail(event.userEmail(), event.userFirstName());
            System.out.println("[OBSERVER] Email notification sent for workout " + event.workoutId());
        } catch (Exception ex) {
            System.out.println("[OBSERVER] Email notification skipped: " + ex.getMessage());
        }
    }
}
