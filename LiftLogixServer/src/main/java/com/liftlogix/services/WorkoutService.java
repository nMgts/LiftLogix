package com.liftlogix.services;

import com.liftlogix.convert.WorkoutUnitDTOMapper;
import com.liftlogix.dto.WorkoutUnitDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.Client;
import com.liftlogix.models.User;
import com.liftlogix.models.WorkoutUnit;
import com.liftlogix.repositories.PersonalPlanRepository;
import com.liftlogix.repositories.WorkoutUnitRepository;
import com.liftlogix.types.Role;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@AllArgsConstructor
public class WorkoutService {
    private final WorkoutUnitRepository workoutUnitRepository;
    private final PersonalPlanRepository personalPlanRepository;
    private final WorkoutUnitDTOMapper workoutUnitDTOMapper;
    private final CoachSchedulerService coachSchedulerService;

    /*
    public WorkoutDTO getWorkout(Long id) {
        Workout workout = workoutRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Workout not found")
        );

        return workoutDTOMapper.mapEntityToDTO(workout);
    }
    */

    public void toggleIndividual(Long id, User user) {
        WorkoutUnit workout = workoutUnitRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Workout unit not found")
        );

        Client client = personalPlanRepository.findClientByWorkoutUnitId(id).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );

        if (!Objects.equals(client.getCoach().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        workout.setIndividual(!workout.isIndividual());

        if (!workout.isIndividual()) {
            coachSchedulerService.addWorkout(id);
        } else {
            coachSchedulerService.removeWorkout(id);
        }

        workoutUnitRepository.save(workout);
    }

    public WorkoutUnitDTO changeDate(Long id, LocalDateTime newDate, Integer duration, User user) {
        WorkoutUnit workout = workoutUnitRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Workout unit not found")
        );

        Client client = personalPlanRepository.findClientByWorkoutUnitId(id).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );

        if (!Objects.equals(client.getCoach().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        workout.setDuration(duration);
        workout.setDate(newDate);

        if (!workout.isIndividual()) {
            coachSchedulerService.onChangeWorkoutDate(id, newDate, duration);
        }

        workoutUnitRepository.save(workout);
        return workoutUnitDTOMapper.mapEntityToDTO(workout);
    }
}
