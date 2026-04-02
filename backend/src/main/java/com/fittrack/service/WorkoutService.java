package com.fittrack.service;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fittrack.dto.WorkoutDetailResponseDTO;
import com.fittrack.dto.WorkoutLogDTO;
import com.fittrack.dto.WorkoutResponseDTO;
import com.fittrack.dto.WorkoutSaveRequestDTO;
import com.fittrack.entity.Exercise;
import com.fittrack.entity.Workout;
import com.fittrack.entity.WorkoutLog;
import com.fittrack.repository.ExerciseRepository;
import com.fittrack.repository.UserRepository;
import com.fittrack.repository.WorkoutLogRepository;
import com.fittrack.repository.WorkoutRepository;
import com.fittrack.util.ResourceNotFoundException;

@Service
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;
    private final EmailService emailService;

    public WorkoutService(
            WorkoutRepository workoutRepository,
            WorkoutLogRepository workoutLogRepository,
            UserRepository userRepository,
            ExerciseRepository exerciseRepository,
            EmailService emailService
    ) {
        this.workoutRepository = workoutRepository;
        this.workoutLogRepository = workoutLogRepository;
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public List<WorkoutResponseDTO> getWorkouts(String email) {
        Map<String, String> exerciseGroups = loadExerciseGroups();
        return workoutRepository.findByUserEmailOrderByWorkoutDateDesc(email).stream()
                .map(workout -> toSummaryResponse(workout, exerciseGroups))
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkoutDetailResponseDTO getWorkoutById(String email, Long id) {
        Map<String, String> exerciseGroups = loadExerciseGroups();
        Workout workout = workoutRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found"));
        return toDetailResponse(workout, exerciseGroups);
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
        workout.setTitle(resolveWorkoutTitle(request.workoutName()));
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

        return toSummaryResponse(savedWorkout, loadExerciseGroups());
    }

    private WorkoutLog toWorkoutLog(Workout workout, WorkoutSaveRequestDTO.WorkoutLogSaveRequestDTO logRequest) {
        if (logRequest.exerciseName() == null || logRequest.exerciseName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exercise name is required");
        }

        WorkoutLog workoutLog = new WorkoutLog();
        workoutLog.setWorkout(workout);
        workoutLog.setExerciseName(logRequest.exerciseName().trim());
        workoutLog.setMuscleGroup(resolveMuscleGroup(logRequest.muscleGroup()));
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

    private WorkoutResponseDTO toSummaryResponse(Workout workout, Map<String, String> exerciseGroups) {
        List<WorkoutLogDTO> logs = toLogResponses(workout, exerciseGroups);

        return new WorkoutResponseDTO(
                workout.getId(),
                resolveWorkoutTitle(workout.getTitle()),
                workout.getWorkoutDate(),
                workout.getCreatedAt(),
                logs.size(),
                logs
        );
    }

    private WorkoutDetailResponseDTO toDetailResponse(Workout workout, Map<String, String> exerciseGroups) {
        List<WorkoutLogDTO> logs = toLogResponses(workout, exerciseGroups);

        return new WorkoutDetailResponseDTO(
                workout.getId(),
                resolveWorkoutTitle(workout.getTitle()),
                workout.getWorkoutDate(),
                workout.getCreatedAt(),
                logs
        );
    }

    private List<WorkoutLogDTO> toLogResponses(Workout workout, Map<String, String> exerciseGroups) {
        return workout.getLogs().stream()
                .map(workoutLog -> toLogResponse(workoutLog, exerciseGroups))
                .toList();
    }

    private WorkoutLogDTO toLogResponse(WorkoutLog workoutLog, Map<String, String> exerciseGroups) {
        String exerciseName = workoutLog.getExerciseName();
        String normalizedName = exerciseName == null ? "" : exerciseName.trim().toLowerCase(Locale.ROOT);
        String muscleGroup = resolveMuscleGroup(
                workoutLog.getMuscleGroup(),
                exerciseGroups.get(normalizedName)
        );

        return new WorkoutLogDTO(
                workoutLog.getId(),
                exerciseName,
                muscleGroup,
                workoutLog.getSets(),
                workoutLog.getReps()
        );
    }

    private Map<String, String> loadExerciseGroups() {
        Map<String, String> exerciseGroups = new HashMap<>();
        for (Exercise exercise : exerciseRepository.findAll()) {
            if (exercise.getName() == null || exercise.getName().isBlank()) {
                continue;
            }

            exerciseGroups.put(
                    exercise.getName().trim().toLowerCase(Locale.ROOT),
                    resolveMuscleGroup(exercise.getMuscleGroup())
            );
        }
        return exerciseGroups;
    }

    private String resolveWorkoutTitle(String title) {
        return title == null || title.isBlank() ? "Workout Session" : title.trim();
    }

    private String resolveMuscleGroup(String muscleGroup) {
        return muscleGroup == null || muscleGroup.isBlank() ? "General" : muscleGroup.trim();
    }

    private String resolveMuscleGroup(String storedMuscleGroup, String fallbackMuscleGroup) {
        if (storedMuscleGroup != null && !storedMuscleGroup.isBlank()) {
            String normalizedStored = storedMuscleGroup.trim();
            if (!"general".equalsIgnoreCase(normalizedStored)) {
                return normalizedStored;
            }
        }

        return resolveMuscleGroup(fallbackMuscleGroup);
    }
}