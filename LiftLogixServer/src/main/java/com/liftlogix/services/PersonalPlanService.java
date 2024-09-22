package com.liftlogix.services;

import com.liftlogix.convert.BasicPersonalPlanDTOMapper;
import com.liftlogix.convert.PersonalPlanDTOMapper;
import com.liftlogix.dto.*;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.exceptions.NoActivePlanException;
import com.liftlogix.models.*;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.PersonalPlanRepository;
import com.liftlogix.types.Role;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PersonalPlanService {
    private final PersonalPlanRepository personalPlanRepository;
    private final ClientRepository clientRepository;
    private final PersonalPlanDTOMapper personalPlanDTOMapper;
    private final BasicPersonalPlanDTOMapper basicPersonalPlanDTOMapper;
    private final CoachSchedulerService coachSchedulerService;

    public List<BasicPersonalPlanDTO> getAllClientPlans(Long clientId, User user) {
        List<PersonalPlan> personalPlans = personalPlanRepository.findByClientId(clientId);

        if (!personalPlans.isEmpty()) {
            PersonalPlan plan = personalPlans.getFirst();
            Client client = plan.getClient();

            if (!Objects.equals(client.getCoach().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
                throw new AuthorizationException("You are not authorized");
            }
        }

        return personalPlans.stream()
                .map(basicPersonalPlanDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    public PersonalPlanDTO getPlanDetails(Long id, User user) {
        PersonalPlan plan = personalPlanRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Personal plan not found")
        );

        Client client = plan.getClient();

        if (!Objects.equals(client.getCoach().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        PersonalPlanDTO planDTO = personalPlanDTOMapper.mapEntityToDTO(plan);

        for (MesocycleDTO mesocycle : planDTO.getMesocycles()) {
            for (MicrocycleDTO microcycle : mesocycle.getMicrocycles()) {
                for (WorkoutUnitDTO workout : microcycle.getWorkoutUnits()) {
                    workout.getWorkoutExercises().sort(Comparator.comparingLong(WorkoutExerciseDTO::getId));
                }
            }
        }

        return planDTO;
    }

    public PersonalPlanDTO getActivePlanByClientId(Long clientId, User user) {
        Client client = clientRepository.findById(clientId).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );

        if (!Objects.equals(client.getCoach().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        return personalPlanRepository.findByClientIdAndIsActiveTrue(clientId)
                .map(personalPlanDTOMapper::mapEntityToDTO).orElseThrow(
                        () -> new NoActivePlanException("Client do not have active plan")
                );
    }

    public void deactivatePlan(Long planId, User user) {
        PersonalPlan plan = personalPlanRepository.findById(planId).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        Client client = plan.getClient();
        if (!Objects.equals(client.getCoach().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        plan.setActive(false);
        plan.setEndDate(LocalDate.now());

        for (Mesocycle mesocycle: plan.getMesocycles()) {
            for (Microcycle microcycle: mesocycle.getMicrocycles()) {
                for (WorkoutUnit workoutUnit: microcycle.getWorkoutUnits()) {
                    if (!workoutUnit.isIndividual()) {
                        coachSchedulerService.removeWorkout(workoutUnit.getId());
                    }
                }
            }
        }

        personalPlanRepository.save(plan);
    }

    public PersonalPlanDTO createPersonalPlan(PersonalPlanDTO planDTO, User user) {
        setWorkoutDatesForPlan(planDTO);
        PersonalPlan plan = personalPlanDTOMapper.mapDTOToEntity(planDTO);

        Client client = clientRepository.findById(plan.getClient().getId()).orElseThrow(
                ( ) -> new EntityNotFoundException("Client not found")
        );

        if (!Objects.equals(client.getCoach().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        plan.getMesocycles().forEach(mesocycle -> {
            mesocycle.setId(null);
            mesocycle.getMicrocycles().forEach(microcycle -> {
                microcycle.setId(null);
                List<Workout> workouts = new ArrayList<>();
                microcycle.setWorkouts(workouts);
                microcycle.getWorkoutUnits().forEach(workout ->
                        workout.getWorkoutExercises().forEach(exercise -> exercise.setId(null)));
            });
        });

        plan.setActive(true);
        PersonalPlan savedPlan = personalPlanRepository.save(plan);

        return personalPlanDTOMapper.mapEntityToDTO(savedPlan);
    }

    public void deletePlan(Long id, User user) {
        PersonalPlan plan = personalPlanRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Personal plan not found")
        );

        Client client = plan.getClient();
        if (!Objects.equals(client.getCoach().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        personalPlanRepository.deleteById(id);
    }

    public PersonalPlanDTO getPersonalPlanByWorkoutId(Long workoutId, User user) {
        PersonalPlan personalPlan = personalPlanRepository.findByWorkoutUnitId(workoutId).orElseThrow(
                () -> new EntityNotFoundException("Personal plan not found for the given workout ID")
        );

        Client client = personalPlan.getClient();
        if (!Objects.equals(client.getCoach().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        return personalPlanDTOMapper.mapEntityToDTO(personalPlan);
    }

    public PersonalPlanDTO editPlan(PersonalPlanDTO personalPlanDTO, User user) {
        PersonalPlan personalPlan = personalPlanRepository.findById(personalPlanDTO.getId()).orElseThrow(
                () -> new EntityNotFoundException("Personal plan not found")
        );

        LocalDate startDate = personalPlan.getStartDate();
        Coach coach = personalPlan.getClient().getCoach();

        if (!Objects.equals(coach.getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        for (Mesocycle mesocycle : personalPlan.getMesocycles()) {
            for (Microcycle microcycle : mesocycle.getMicrocycles()) {
                for (WorkoutUnit workoutUnit : microcycle.getWorkoutUnits()) {
                    if (!workoutUnit.isIndividual()) {
                        coachSchedulerService.removeWorkout(workoutUnit.getId());
                    }
                }
            }
        }

        personalPlanRepository.delete(personalPlan);

        personalPlanDTO.setStartDate(startDate);
        setWorkoutDatesForPlan(personalPlanDTO);

        PersonalPlan newPersonalPlan = personalPlanDTOMapper.mapDTOToEntity(personalPlanDTO);
        newPersonalPlan.setActive(true);

        personalPlanRepository.save(newPersonalPlan);
        return personalPlanDTOMapper.mapEntityToDTO(newPersonalPlan);
    }

    public String getPlanName(Long id) {

        PersonalPlan plan = personalPlanRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        return plan.getName();
    }

    private void setWorkoutDatesForPlan(PersonalPlanDTO personalPlanDTO) {
        LocalDate currentDate = personalPlanDTO.getStartDate();
        int dayCount = 0;

        for (MesocycleDTO mesocycle : personalPlanDTO.getMesocycles()) {
            for (MicrocycleDTO microcycle : mesocycle.getMicrocycles()) {
                Integer microcycleLength = microcycle.getLength();
                for (WorkoutUnitDTO workout : microcycle.getWorkoutUnits()) {

                    LocalDate date = currentDate.plusDays(dayCount + (workout.getMicrocycleDay() - 1));
                    LocalDateTime dateTime = LocalDateTime.of(date, LocalTime.of(0, 0));

                    workout.setDate(dateTime);
                    workout.setDuration(60);
                    workout.setIndividual(true);
                }
                dayCount += microcycleLength;
            }
        }
    }
}
