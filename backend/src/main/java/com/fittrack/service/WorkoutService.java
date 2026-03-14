package com.fittrack.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fittrack.dto.WorkoutLogResponseDTO;
import com.fittrack.dto.WorkoutResponseDTO;
import com.fittrack.dto.WorkoutSaveRequestDTO;
import com.fittrack.entity.Workout;
import com.fittrack.entity.WorkoutLog;
import com.fittrack.repository.UserRepository;
import com.fittrack.repository.WorkoutRepository;
import com.fittrack.util.ResourceNotFoundException;

@Service
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public WorkoutService(
            WorkoutRepository workoutRepository,
            UserRepository userRepository,
            EmailService emailService
    ) {
        this.workoutRepository = workoutRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public List<WorkoutResponseDTO> getWorkouts(String email) {
        return workoutRepository.findByUserEmailOrderByPerformedAtDesc(email).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkoutResponseDTO getWorkoutById(String email, Long id) {
        Workout workout = workoutRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found"));
        return toResponse(workout);
    }

    @Transactional
    public WorkoutResponseDTO saveWorkout(String email, WorkoutSaveRequestDTO request) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Workout workout = new Workout();
        workout.setTitle(request.title());
        workout.setNotes(request.notes());
        workout.setPerformedAt(request.performedAt());
        workout.setUser(user);

        Workout savedWorkout = workoutRepository.save(workout);
        sendWorkoutNotificationSafely(user.getEmail(), user.getFirstName());

        return toResponse(savedWorkout);
    }

    private void sendWorkoutNotificationSafely(String email, String firstName) {
        try {
            emailService.sendWorkoutSavedEmail(email, firstName);
        } catch (Exception ignored) {
        }
    }

    private WorkoutResponseDTO toResponse(Workout workout) {
        List<WorkoutLogResponseDTO> logs = workout.getLogs().stream()
                .map(this::toLogResponse)
                .toList();

        return new WorkoutResponseDTO(
                workout.getId(),
                workout.getTitle(),
                workout.getNotes(),
                workout.getPerformedAt(),
                workout.getCreatedAt(),
                workout.getUpdatedAt(),
                logs
        );
    }

    private WorkoutLogResponseDTO toLogResponse(WorkoutLog workoutLog) {
        return new WorkoutLogResponseDTO(
                workoutLog.getId(),
                workoutLog.getExercise().getId(),
                workoutLog.getExercise().getName(),
                workoutLog.getSetsCompleted(),
                workoutLog.getRepsCompleted(),
                workoutLog.getWeightKg(),
                workoutLog.getDurationMinutes(),
                workoutLog.getNotes(),
                workoutLog.getLoggedAt(),
                workoutLog.getCreatedAt(),
                workoutLog.getUpdatedAt()
        );
    }
}