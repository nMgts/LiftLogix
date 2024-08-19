package com.liftlogix.services;

import com.liftlogix.convert.BasicPlanDTOMapper;
import com.liftlogix.convert.PlanDTOMapper;
import com.liftlogix.dto.BasicPlanDTO;
import com.liftlogix.dto.PlanDTO;
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

        Plan plan = planDTOMapper.mapDTOToEntityWithPlanAssociation(planDTO);
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

        return planDTOMapper.mapEntityToDTO(plan);
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
        newPlan.setMesocycles(plan.getMesocycles());
        newPlan.setName(plan.getName());
        newPlan.setPublic(false);
        newPlan.setAuthor(user);

        PlanDTO dto = planDTOMapper.mapEntityToDTO(newPlan);
        savePlan(dto, user);
    }


    /** CAN SOMEBODY HELP??? Works but ... omg **/
    public PlanDTO editPlan(PlanDTO planDTO, User user) {

        Plan existingPlan = planRepository.findById(planDTO.getId()).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        if (!Objects.equals(existingPlan.getAuthor().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        planRepository.delete(existingPlan);

        Plan newPlan = planDTOMapper.mapDTOToEntityWithPlanAssociation(planDTO);
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
}
