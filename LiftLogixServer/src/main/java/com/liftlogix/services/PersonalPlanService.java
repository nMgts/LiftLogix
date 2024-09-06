package com.liftlogix.services;

import com.liftlogix.convert.PersonalPlanDTOMapper;
import com.liftlogix.dto.MesocycleDTO;
import com.liftlogix.dto.MicrocycleDTO;
import com.liftlogix.dto.PersonalPlanDTO;
import com.liftlogix.dto.WorkoutDTO;
import com.liftlogix.models.PersonalPlan;
import com.liftlogix.repositories.PersonalPlanRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class PersonalPlanService {
    private final PersonalPlanRepository personalPlanRepository;
    private final PersonalPlanDTOMapper personalPlanDTOMapper;

    public Optional<PersonalPlanDTO> getActivePlanByClientId(Long clientId) {
        return personalPlanRepository.findByClientIdAndIsActiveTrue(clientId)
                .map(personalPlanDTOMapper::mapEntityToDTO);
    }

    public void deactivatePlan(Long planId) {
        PersonalPlan plan = personalPlanRepository.findById(planId).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );
        plan.setActive(false);
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
