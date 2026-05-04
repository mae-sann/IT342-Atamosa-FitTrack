package com.fittrack.workout;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.fittrack.workout.WorkoutSavedEvent;

@Component
public class WorkoutSavedAuditObserver {

    @EventListener
    public void onWorkoutSaved(WorkoutSavedEvent event) {
        System.out.println("[OBSERVER] Workout saved event received: id=" + event.workoutId()
                + ", user=" + event.userEmail()
                + ", date=" + event.workoutDate()
                + ", logs=" + event.totalExercises());

        // Future extension point:
        // - Update goal progress
        // - Update streak counters
        // - Publish analytics
    }
}
