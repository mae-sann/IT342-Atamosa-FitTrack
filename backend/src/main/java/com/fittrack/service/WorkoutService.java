package com.fittrack.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fittrack.dto.WorkoutDetailResponseDTO;
import com.fittrack.dto.WorkoutResponseDTO;
import com.fittrack.dto.WorkoutSaveRequestDTO;
import com.fittrack.entity.Workout;
import com.fittrack.entity.WorkoutLog;
import com.fittrack.repository.UserRepository;
import com.fittrack.repository.WorkoutLogRepository;
import com.fittrack.repository.WorkoutRepository;
import com.fittrack.util.ResourceNotFoundException;

@Service
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public WorkoutService(
            WorkoutRepository workoutRepository,
            WorkoutLogRepository workoutLogRepository,
            UserRepository userRepository,
            EmailService emailService
    ) {
        this.workoutRepository = workoutRepository;
        this.workoutLogRepository = workoutLogRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public List<WorkoutResponseDTO> getWorkouts(String email) {
        return workoutRepository.findByUserEmailOrderByWorkoutDateDesc(email).stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkoutDetailResponseDTO getWorkoutById(String email, Long id) {
        Workout workout = workoutRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found"));
        return toDetailResponse(workout);
    }

    @Transactional
    public void deleteWorkout(String email, Long id) {
        Workout workout = workoutRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found"));

        workoutLogRepository.deleteByWorkoutId(workout.getId());
        workoutRepository.deleteById(workout.getId());
    }

    @Transactional
    public WorkoutResponseDTO saveWorkout(String email, WorkoutSaveRequestDTO request) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Workout workout = new Workout();
        workout.setWorkoutDate(request.workoutDate());
        workout.setUser(user);

        Workout savedWorkout = workoutRepository.save(workout);

        if (request.logs() != null && !request.logs().isEmpty()) {
            List<WorkoutLog> workoutLogs = request.logs().stream()
                    .map(logRequest -> toWorkoutLog(savedWorkout, logRequest))
                    .toList();

            List<WorkoutLog> savedLogs = workoutLogRepository.saveAll(workoutLogs);
            savedWorkout.setLogs(savedLogs);
        }

        sendWorkoutNotificationSafely(user.getEmail(), user.getFirstName());

        return toSummaryResponse(savedWorkout);
    }

    private WorkoutLog toWorkoutLog(Workout workout, WorkoutSaveRequestDTO.WorkoutLogSaveRequestDTO logRequest) {
        if (logRequest.exerciseName() == null || logRequest.exerciseName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exercise name is required");
        }

        WorkoutLog workoutLog = new WorkoutLog();
        workoutLog.setWorkout(workout);
        workoutLog.setExerciseName(logRequest.exerciseName().trim());
        workoutLog.setSets(logRequest.sets());
        workoutLog.setReps(logRequest.reps());
        workoutLog.setWorkoutDate(workout.getWorkoutDate());
        return workoutLog;
    }

    private void sendWorkoutNotificationSafely(String email, String firstName) {
        try {
            emailService.sendWorkoutSavedEmail(email, firstName);
        } catch (Exception ignored) {
        }
    }

    private WorkoutResponseDTO toSummaryResponse(Workout workout) {
        return new WorkoutResponseDTO(
                workout.getId(),
                workout.getWorkoutDate(),
                workout.getCreatedAt(),
                workout.getLogs().size()
        );
    }

    private WorkoutDetailResponseDTO toDetailResponse(Workout workout) {
        List<WorkoutDetailResponseDTO.WorkoutLogItemDTO> logs = workout.getLogs().stream()
                .map(this::toDetailLogResponse)
                .toList();

        return new WorkoutDetailResponseDTO(
                workout.getId(),
                workout.getWorkoutDate(),
                workout.getCreatedAt(),
                logs
        );
    }

    private WorkoutDetailResponseDTO.WorkoutLogItemDTO toDetailLogResponse(WorkoutLog workoutLog) {
        return new WorkoutDetailResponseDTO.WorkoutLogItemDTO(
                workoutLog.getExerciseName(),
                workoutLog.getSets(),
                workoutLog.getReps()
        );
    }
}