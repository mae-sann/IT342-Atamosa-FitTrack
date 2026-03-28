package com.fittrack.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fittrack.dto.ExerciseRequestDTO;
import com.fittrack.dto.ExerciseResponseDTO;
import com.fittrack.entity.Exercise;
import com.fittrack.repository.ExerciseRepository;
import com.fittrack.util.ResourceNotFoundException;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional(readOnly = true)
    public List<ExerciseResponseDTO> getAllExercises() {
        return exerciseRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ExerciseResponseDTO createExercise(ExerciseRequestDTO request) {
        validateNameUniqueness(request.name(), null);

        Exercise exercise = new Exercise();
        applyRequest(exercise, request);
        return toResponse(exerciseRepository.save(exercise));
    }

    @Transactional
    public ExerciseResponseDTO updateExercise(Long id, ExerciseRequestDTO request) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

        validateNameUniqueness(request.name(), id);
        applyRequest(exercise, request);
        return toResponse(exerciseRepository.save(exercise));
    }

    @Transactional
    public void deleteExercise(Long id) {
        if (!exerciseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Exercise not found");
        }
        exerciseRepository.deleteById(id);
    }

    private void validateNameUniqueness(String name, Long currentExerciseId) {
        exerciseRepository.findByNameIgnoreCase(name)
                .filter(existing -> currentExerciseId == null || !existing.getId().equals(currentExerciseId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Exercise name already exists");
                });
    }

    private void applyRequest(Exercise exercise, ExerciseRequestDTO request) {
        exercise.setName(request.name().trim());
        exercise.setMuscleGroup(request.muscleGroup().trim());
        exercise.setDescription(request.description() == null ? null : request.description().trim());
    }

    private ExerciseResponseDTO toResponse(Exercise exercise) {
        return new ExerciseResponseDTO(
                exercise.getId(),
                exercise.getName(),
            exercise.getMuscleGroup(),
                exercise.getDescription()
        );
    }
}
