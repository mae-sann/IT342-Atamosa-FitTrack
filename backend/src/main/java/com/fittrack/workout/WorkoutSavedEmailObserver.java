package com.fittrack.workout;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.fittrack.workout.WorkoutSavedEvent;
import com.fittrack.user.EmailService;

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
