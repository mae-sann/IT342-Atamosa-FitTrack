package com.fittrack.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public class WorkoutRequestDto {

    @NotBlank(message = "Workout date is required")
    private String workoutDate;

    private String notes;

    @Valid
    @NotEmpty(message = "At least one exercise is required")
    private List<ExerciseRequestDTO> exercises;

    public String getWorkoutDate() {
        return workoutDate;
    }

    public void setWorkoutDate(String workoutDate) {
        this.workoutDate = workoutDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<ExerciseRequestDTO> getExercises() {
        return exercises;
    }

    public void setExercises(List<ExerciseRequestDTO> exercises) {
        this.exercises = exercises;
    }
}
