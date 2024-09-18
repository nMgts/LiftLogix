package com.liftlogix.services;

import com.liftlogix.convert.WorkoutDTOMapper;
import com.liftlogix.dto.WorkoutDTO;
import com.liftlogix.models.Workout;
import com.liftlogix.models.WorkoutDate;
import com.liftlogix.repositories.WorkoutRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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

    public void toggleIndividual(Long id, LocalDateTime date) {
        Workout workout = workoutRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Workout not found")
        );

        boolean updated = false;
        for (WorkoutDate workoutDate : workout.getDates()) {
            if (workoutDate.getDate().isEqual(date)) {
                workoutDate.setIndividual(!workoutDate.isIndividual());
                updated = true;
                break;
            }
        }

        if (!updated) {
            throw new EntityNotFoundException("Date not found in workout");
        }

        workoutRepository.save(workout);
    }

    public WorkoutDTO changeDate(WorkoutDTO dto) {
        Workout workout = workoutRepository.findById(dto.getId()).orElseThrow(
                () -> new EntityNotFoundException("Workout not found")
        );

        for (WorkoutDate workoutDate : workout.getDates()) {
            workoutDate.setIndividual(!workoutDate.isIndividual());
        }

        workoutRepository.save(workout);
        return workoutDTOMapper.mapEntityToDTO(workout);
    }
}
