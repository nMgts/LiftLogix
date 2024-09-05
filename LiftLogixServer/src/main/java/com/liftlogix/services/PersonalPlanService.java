package com.liftlogix.services;

import com.liftlogix.convert.PersonalPlanDTOMapper;
import com.liftlogix.dto.PersonalPlanDTO;
import com.liftlogix.models.PersonalPlan;
import com.liftlogix.repositories.PersonalPlanRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

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
        PersonalPlan plan = personalPlanDTOMapper.mapDTOToEntity(planDTO);

        plan.getMesocycles().forEach(mesocycle -> {
            mesocycle.setId(null);

            mesocycle.getMicrocycles().forEach(microcycle -> {
                microcycle.setId(null);

                microcycle.getWorkouts().forEach(workout -> {
                    workout.setId(null);

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
}
