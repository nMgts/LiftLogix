package com.liftlogix.services;

import com.liftlogix.convert.BasicPlanDTOMapper;
import com.liftlogix.convert.PlanDTOMapper;
import com.liftlogix.dto.BasicPlanDTO;
import com.liftlogix.dto.PlanDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.Plan;
import com.liftlogix.models.User;
import com.liftlogix.repositories.PlanRepository;
import com.liftlogix.types.Role;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
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
        System.out.println(savedPlan.getAuthor().getRole());
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
            if (!plan.getAuthor().equals(user) && !user.getRole().equals(Role.ADMIN)) {
                throw new AuthorizationException("You are not authorized");
            }
        }

        return planDTOMapper.mapEntityToDTO(plan);
    }
}
