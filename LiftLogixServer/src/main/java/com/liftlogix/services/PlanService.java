package com.liftlogix.services;

import com.liftlogix.convert.BasicPlanDTOMapper;
import com.liftlogix.convert.PlanDTOMapper;
import com.liftlogix.dto.*;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.*;
import com.liftlogix.repositories.PlanRepository;
import com.liftlogix.types.Role;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PlanService {
    private final PlanRepository planRepository;
    private final PlanDTOMapper planDTOMapper;
    private final BasicPlanDTOMapper basicPlanDTOMapper;

    public PlanDTO savePlan(PlanDTO planDTO, User author) {

        Plan plan = planDTOMapper.mapDTOToEntity(planDTO);
        plan.setAuthor(author);

        Plan savedPlan = planRepository.save(plan);

        return planDTOMapper.mapEntityToDTO(savedPlan);
    }

    public List<BasicPlanDTO> getBasicPlansByAuthor(User author) {
        List<Plan> plans = planRepository.findByAuthor(author);
        return plans.stream()
                .map(basicPlanDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    public List<BasicPlanDTO> getBasicPublicPlans() {
        List<Plan> plans = planRepository.findByIsPublicTrue();
        return plans.stream()
                .map(basicPlanDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    public PlanDTO getPlanDetails(Long planId, User user) {
        Plan plan = planRepository.findById(planId).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        if (!plan.isPublic()) {
            if (!Objects.equals(plan.getAuthor().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
                throw new AuthorizationException("You are not authorized");
            }
        }

        PlanDTO planDTO = planDTOMapper.mapEntityToDTO(plan);

        for (MesocycleDTO mesocycle : planDTO.getMesocycles()) {
            for (MicrocycleDTO microcycle : mesocycle.getMicrocycles()) {
                for (WorkoutDTO workout : microcycle.getWorkouts()) {
                    workout.getWorkoutExercises().sort(Comparator.comparingLong(WorkoutExerciseDTO::getId));
                }
            }
        }

        return planDTO;
    }

    public void deletePlan(Long planId, User user) {
        Plan plan = planRepository.findById(planId).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        if (!Objects.equals(plan.getAuthor().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        planRepository.deleteById(planId);
    }

    public void addToMyPlans(Long planId, User user) {
        Plan plan = planRepository.findById(planId).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        if (Objects.equals(plan.getAuthor().getEmail(), user.getEmail())) {
            throw new IllegalArgumentException("It is already your plan");
        }

        Plan newPlan = new Plan();
        newPlan.setName(plan.getName());
        newPlan.setPublic(false);
        newPlan.setAuthor(user);

        List<Mesocycle> newMesocycles = plan.getMesocycles().stream()
                .map(this::copyMesocycle)
                .collect(Collectors.toList());

        newPlan.setMesocycles(newMesocycles);

        PlanDTO dto = planDTOMapper.mapEntityToDTO(newPlan);
        savePlan(dto, user);
    }


    public PlanDTO editPlan(PlanDTO planDTO, User user) {

        Plan existingPlan = planRepository.findById(planDTO.getId()).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        if (!Objects.equals(existingPlan.getAuthor().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        planRepository.delete(existingPlan);

        Plan newPlan = planDTOMapper.mapDTOToEntity(planDTO);
        newPlan.setAuthor(user);

        planRepository.save(newPlan);
        return planDTOMapper.mapEntityToDTO(newPlan);
    }

    public void renamePlan(Long id, String name, User user) {

        Plan plan = planRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        if (!Objects.equals(plan.getAuthor().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        plan.setName(name);
        planRepository.save(plan);
    }

    public void changePlanVisibility(Long id, boolean visible, User user) {

        Plan plan = planRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        if (!Objects.equals(plan.getAuthor().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        plan.setPublic(visible);
        planRepository.save(plan);
    }

    public String getPlanName(Long id) {

        Plan plan = planRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        return plan.getName();
    }

    public void duplicatePlan(Long planId, User user) {
        Plan plan = planRepository.findById(planId).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        if (!Objects.equals(plan.getAuthor().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        Plan newPlan = new Plan();
        newPlan.setPublic(false);
        newPlan.setAuthor(user);

        String planName = plan.getName();
        if (!planName.endsWith(" kopia")) {
            planName += " kopia";
        }
        newPlan.setName(planName);

        List<Mesocycle> newMesocycles = plan.getMesocycles().stream()
                .map(this::copyMesocycle)
                .collect(Collectors.toList());

        newPlan.setMesocycles(newMesocycles);

        PlanDTO dto = planDTOMapper.mapEntityToDTO(newPlan);
        savePlan(dto, user);
    }

    private Mesocycle copyMesocycle(Mesocycle oldMesocycle) {
        Mesocycle newMesocycle = new Mesocycle();
        newMesocycle.setMicrocycles(oldMesocycle.getMicrocycles().stream()
                .map(this::copyMicrocycle)
                .collect(Collectors.toList()));
        return newMesocycle;
    }

    private Microcycle copyMicrocycle(Microcycle oldMicrocycle) {
        Microcycle newMicrocycle = new Microcycle();
        newMicrocycle.setLength(oldMicrocycle.getLength());
        newMicrocycle.setWorkouts(oldMicrocycle.getWorkouts().stream()
                .map(this::copyWorkout)
                .collect(Collectors.toList()));
        return newMicrocycle;
    }

    private Workout copyWorkout(Workout oldWorkout) {
        Workout newWorkout = new Workout();
        newWorkout.setName(oldWorkout.getName());

        newWorkout.setDays(new ArrayList<>(oldWorkout.getDays()));

        List<WorkoutExercise> newExercises = oldWorkout.getWorkoutExercises().stream()
                .map(oldExercise -> copyWorkoutExercise(oldExercise, newWorkout))
                .collect(Collectors.toList());

        newWorkout.setWorkoutExercises(newExercises);
        return newWorkout;
    }

    private WorkoutExercise copyWorkoutExercise(WorkoutExercise oldExercise, Workout newWorkout) {
        WorkoutExercise newExercise = new WorkoutExercise();

        newExercise.setSeries(oldExercise.getSeries());
        newExercise.setRepetitionsFrom(oldExercise.getRepetitionsFrom());
        newExercise.setRepetitionsTo(oldExercise.getRepetitionsTo());
        newExercise.setWeight(oldExercise.getWeight());
        newExercise.setPercentage(oldExercise.getPercentage());
        newExercise.setTempo(oldExercise.getTempo());
        newExercise.setRpe(oldExercise.getRpe());
        newExercise.setBreakTime(oldExercise.getBreakTime());
        newExercise.setDifficultyFactor(oldExercise.getDifficultyFactor());

        newExercise.setExercise(oldExercise.getExercise());
        newExercise.setWorkout(newWorkout);

        return newExercise;
    }
}
