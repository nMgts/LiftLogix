package com.liftlogix.services;

import com.liftlogix.convert.BasicPersonalPlanDTOMapper;
import com.liftlogix.convert.PersonalPlanDTOMapper;
import com.liftlogix.dto.*;
import com.liftlogix.models.PersonalPlan;
import com.liftlogix.repositories.PersonalPlanRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
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
                    List<LocalDateTime> workoutDates = workout.getDates();

                    if (workoutDates != null) {
                        for (LocalDateTime date : workoutDates) {
                            System.out.println(date);
                        }
                    } else {
                        System.out.println("No dates available for this workout.");
                    }

                    workout.getWorkoutExercises().forEach(exercise -> {
                        exercise.setId(null);
                    });
                });
            });
        });

        plan.setActive(true);
        PersonalPlan savedPlan = personalPlanRepository.save(plan);

        return personalPlanDTOMapper.mapEntityToDTO(savedPlan);
    }

    public void deletePlan(Long id) {
        PersonalPlan plan = personalPlanRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Personal plan not found")
        );

        personalPlanRepository.deleteById(id);
    }

    private void setWorkoutDatesForPlan(PersonalPlanDTO personalPlanDTO) {
        LocalDate currentDate = personalPlanDTO.getStartDate();
        int dayCount = 0;

        for (MesocycleDTO mesocycle : personalPlanDTO.getMesocycles()) {
            for (MicrocycleDTO microcycle : mesocycle.getMicrocycles()) {
                Integer microcycleLength = microcycle.getLength();

                for (WorkoutDTO workout : microcycle.getWorkouts()) {
                    List<LocalDateTime> workoutDates = new ArrayList<>();

                    for (Integer day : workout.getDays()) {
                        LocalDate workoutDate = currentDate.plusDays(dayCount + (day - 1));
                        LocalDateTime workoutDateTime = LocalDateTime.of(workoutDate, LocalTime.of(0, 0));

                        workoutDates.add(workoutDateTime);
                    }

                    workout.setDates(workoutDates);
                }
                dayCount += microcycleLength;
            }
        }
    }
}
