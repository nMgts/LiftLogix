package com.liftlogix.services;

import com.liftlogix.convert.WorkoutUnitDTOMapper;
import com.liftlogix.dto.WorkoutUnitDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.plans.WorkoutExercise;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.User;
import com.liftlogix.models.plans.WorkoutUnit;
import com.liftlogix.repositories.PersonalPlanRepository;
import com.liftlogix.repositories.WorkoutExerciseRepository;
import com.liftlogix.repositories.WorkoutUnitRepository;
import com.liftlogix.types.Role;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class WorkoutUnitService {
    private final WorkoutUnitRepository workoutUnitRepository;
    private final PersonalPlanRepository personalPlanRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final WorkoutUnitDTOMapper workoutUnitDTOMapper;
    private final CoachSchedulerService coachSchedulerService;

    public WorkoutUnitDTO getWorkout(Long id, User user) {
        WorkoutUnit workout = accessWorkout(id, user);
        return workoutUnitDTOMapper.mapEntityToDTO(workout);
    }

    public void toggleIndividual(Long id, User user) {
        WorkoutUnit workout = accessWorkout(id, user);

        workout.setIndividual(!workout.isIndividual());

        if (!workout.isIndividual()) {
            coachSchedulerService.addWorkout(id);
        } else {
            coachSchedulerService.removeWorkout(id);
        }

        workoutUnitRepository.save(workout);
    }

    public WorkoutUnitDTO changeDate(Long id, LocalDateTime newDate, Integer duration, User user) {
        WorkoutUnit workout = accessWorkout(id, user);

        workout.setDuration(duration);
        workout.setDate(newDate);

        if (!workout.isIndividual()) {
            coachSchedulerService.onChangeWorkoutDate(id, newDate, duration);
        }

        workoutUnitRepository.save(workout);
        return workoutUnitDTOMapper.mapEntityToDTO(workout);
    }

    @Transactional
    public WorkoutUnitDTO editWorkout(WorkoutUnitDTO dto, User user) {
        WorkoutUnit newWorkout = workoutUnitDTOMapper.mapDTOToEntity(dto);
        WorkoutUnit workout = accessWorkout(dto.getId(), user);

        List<WorkoutExercise> existingExercises = new ArrayList<>(workout.getWorkoutExercises());

        for (WorkoutExercise existingExercise : existingExercises) {
            if (!newWorkout.getWorkoutExercises().contains(existingExercise)) {
                workoutExerciseRepository.delete(existingExercise);
            }
        }

        for (WorkoutExercise we : newWorkout.getWorkoutExercises()) {
            if (we.getId() == null) {
                we.setWorkoutUnit(workout);
            }
        }

        workout.getWorkoutExercises().clear();
        workout.getWorkoutExercises().addAll(newWorkout.getWorkoutExercises());

        workoutUnitRepository.save(workout);
        return workoutUnitDTOMapper.mapEntityToDTO(workout);
    }

    private WorkoutUnit accessWorkout(Long id, User user) {
        WorkoutUnit workout = workoutUnitRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Workout unit not found")
        );

        Client client = personalPlanRepository.findClientByWorkoutUnitId(id).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );

        if (!Objects.equals(client.getCoach().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }
        return workout;
    }
}
