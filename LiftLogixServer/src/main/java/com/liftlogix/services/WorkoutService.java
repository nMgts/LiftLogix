package com.liftlogix.services;

import com.liftlogix.convert.WorkoutDTOMapper;
import com.liftlogix.dto.WorkoutDTO;
import com.liftlogix.models.Workout;
import com.liftlogix.repositories.WorkoutRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class WorkoutService {
    private final WorkoutRepository workoutRepository;
    private final WorkoutDTOMapper workoutDTOMapper;

    public WorkoutDTO getWorkout(Long id) {
        Workout workout = workoutRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Workout not found")
        );

        return workoutDTOMapper.mapEntityToDTO(workout);
    }

    public void toggleIndividual(Long id) {
        Workout workout = workoutRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Workout not found")
        );

        workout.setIndividual(!workout.isIndividual());
        workoutRepository.save(workout);
    }

    public WorkoutDTO changeDate(WorkoutDTO dto) {
        Workout workout = workoutRepository.findById(dto.getId()).orElseThrow(
                () -> new EntityNotFoundException("Workout not found")
        );

        workout.setIndividual(dto.isIndividual());
        workoutRepository.save(workout);

        return workoutDTOMapper.mapEntityToDTO(workout);
    }
}
