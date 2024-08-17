package com.liftlogix.services;

import com.liftlogix.convert.PlanDTOMapper;
import com.liftlogix.dto.PlanDTO;
import com.liftlogix.models.Plan;
import com.liftlogix.models.User;
import com.liftlogix.repositories.PlanRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PlanService {
    private final PlanRepository planRepository;
    private final PlanDTOMapper planDTOMapper;

    public PlanDTO savePlan(PlanDTO planDTO, User author) {
        Plan plan = planDTOMapper.mapDTOToEntity(planDTO);
        plan.setAuthor(author);
        Plan savedPlan = planRepository.save(plan);
        System.out.println(savedPlan.getAuthor().getRole());
        return planDTOMapper.mapEntityToDTO(savedPlan);
    }

    public List<PlanDTO> getPlansByAuthor(User author) {
        List<Plan> plans = planRepository.findByAuthor(author);
        return plans.stream()
                .map(planDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    public List<PlanDTO> getPublicPlans() {
        List<Plan> plans = planRepository.findByIsPublicTrue();
        return plans.stream()
                .map(planDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }
}
