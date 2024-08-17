package com.liftlogix.controllers;

import com.liftlogix.dto.PlanDTO;
import com.liftlogix.models.User;
import com.liftlogix.services.PlanService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/plans")
public class PlanController {
    private final PlanService planService;

    @PostMapping("/save")
    public PlanDTO createPlan(@RequestBody PlanDTO planDTO, @AuthenticationPrincipal User currentUser) {
        return planService.savePlan(planDTO, currentUser);
    }

    @GetMapping("/my")
    public List<PlanDTO> getMyPlans(@AuthenticationPrincipal User currentUser) {
        return planService.getPlansByAuthor(currentUser);
    }

    @GetMapping("/public")
    public List<PlanDTO> getPublicPlans() {
        return planService.getPublicPlans();
    }
}
