package com.liftlogix.services;

import com.liftlogix.convert.BasicPersonalPlanDTOMapper;
import com.liftlogix.convert.PersonalPlanDTOMapper;
import com.liftlogix.dto.*;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.Coach;
import com.liftlogix.models.PersonalPlan;
import com.liftlogix.models.User;
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
    private final PersonalPlanDTOMapper personalPlanDTOMapper;
    private final BasicPersonalPlanDTOMapper basicPersonalPlanDTOMapper;

    public List<BasicPersonalPlanDTO> getAllClientPlans(Long clientId) {
        List<PersonalPlan> personalPlans = personalPlanRepository.findByClientId(clientId);

        return personalPlans.stream()
                .map(basicPersonalPlanDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    public PersonalPlanDTO getPlanDetails(Long id) {
        PersonalPlan plan = personalPlanRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Personal plan not found")
        );

        PersonalPlanDTO planDTO = personalPlanDTOMapper.mapEntityToDTO(plan);

        for (MesocycleDTO mesocycle : planDTO.getMesocycles()) {
            for (MicrocycleDTO microcycle : mesocycle.getMicrocycles()) {
                for (WorkoutDTO workout : microcycle.getWorkouts()) {
                    workout.getWorkoutExercises().sort(Comparator.comparingLong(WorkoutExerciseDTO::getId));
                }
            }
        }

        return planDTO;
    }

    public Optional<PersonalPlanDTO> getActivePlanByClientId(Long clientId) {
        return personalPlanRepository.findByClientIdAndIsActiveTrue(clientId)
                .map(personalPlanDTOMapper::mapEntityToDTO);
    }

    public void deactivatePlan(Long planId) {
        PersonalPlan plan = personalPlanRepository.findById(planId).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );
        plan.setActive(false);
        plan.setEndDate(LocalDate.now());
        personalPlanRepository.save(plan);
    }

    public PersonalPlanDTO createPersonalPlan(PersonalPlanDTO planDTO) {
        setWorkoutDatesForPlan(planDTO);
        PersonalPlan plan = personalPlanDTOMapper.mapDTOToEntity(planDTO);

        plan.getMesocycles().forEach(mesocycle -> {
            mesocycle.setId(null);
            mesocycle.getMicrocycles().forEach(microcycle -> {
                microcycle.setId(null);
                microcycle.getWorkouts().forEach(workout -> {
                    workout.setId(null);
                    workout.getWorkoutExercises().forEach(exercise -> exercise.setId(null));
                });
            });
        });

        plan.setActive(true);
        PersonalPlan savedPlan = personalPlanRepository.save(plan);

        return personalPlanDTOMapper.mapEntityToDTO(savedPlan);
    }

    public void deletePlan(Long id) {
        personalPlanRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Personal plan not found")
        );

        personalPlanRepository.deleteById(id);
    }

    public PersonalPlanDTO getPersonalPlanByWorkoutId(Long workoutId) {
        PersonalPlan personalPlan = personalPlanRepository.findByWorkoutId(workoutId).orElseThrow(
                () -> new EntityNotFoundException("Personal plan not found for the given workout ID")
        );
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

        personalPlanRepository.delete(personalPlan);

        personalPlanDTO.setStartDate(startDate);
        setWorkoutDatesForPlan(personalPlanDTO);

        PersonalPlan newPersonalPlan = personalPlanDTOMapper.mapDTOToEntity(personalPlanDTO);
        newPersonalPlan.setActive(true);

        personalPlanRepository.save(newPersonalPlan);
        return personalPlanDTOMapper.mapEntityToDTO(newPersonalPlan);
    }

    private void setWorkoutDatesForPlan(PersonalPlanDTO personalPlanDTO) {
        LocalDate currentDate = personalPlanDTO.getStartDate();
        int dayCount = 0;

        for (MesocycleDTO mesocycle : personalPlanDTO.getMesocycles()) {
            for (MicrocycleDTO microcycle : mesocycle.getMicrocycles()) {
                Integer microcycleLength = microcycle.getLength();

                for (WorkoutDTO workout : microcycle.getWorkouts()) {
                    List<WorkoutDateDTO> workoutDates = createWorkoutDates(workout, currentDate, dayCount);

                    workout.setDates(workoutDates);
                }
                dayCount += microcycleLength;
            }
        }
    }

    private static List<WorkoutDateDTO> createWorkoutDates(WorkoutDTO workout, LocalDate currentDate, int dayCount) {
        List<WorkoutDateDTO> workoutDates = new ArrayList<>();

        for (Integer day : workout.getDays()) {
            WorkoutDateDTO workoutDate = new WorkoutDateDTO();
            LocalDate date = currentDate.plusDays(dayCount + (day - 1));
            LocalDateTime dateTime = LocalDateTime.of(date, LocalTime.of(0, 0));

            workoutDate.setDate(dateTime);
            workoutDate.setIndividual(true);

            workoutDates.add(workoutDate);
        }
        return workoutDates;
    }
}
