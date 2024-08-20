package com.liftlogix.controllers;

import com.liftlogix.dto.PersonalPlanDTO;
import com.liftlogix.dto.PlanDTO;
import com.liftlogix.services.PersonalPlanService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/personal-plan")
@AllArgsConstructor
public class PersonalPlanController {
    private final PersonalPlanService personalPlanService;

    @GetMapping("/is-active/{clientId}")
    public ResponseEntity<PersonalPlanDTO> getActivePlanByClientId(@PathVariable Long clientId) {
        Optional<PersonalPlanDTO> planDTO = personalPlanService.getActivePlanByClientId(clientId);
        return planDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/deactivate/{planId}")
    public ResponseEntity<String> deactivatePlan(@PathVariable Long planId) {
        try {
            personalPlanService.deactivatePlan(planId);
            return ResponseEntity.ok().body("{\"message\": \"Plan deactivated\"}");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPersonalPlan(
            @RequestBody PlanDTO planDTO,
            @RequestParam Long clientId,
            @RequestParam LocalDate startDate) {
        try {
            PersonalPlanDTO createdPlan = personalPlanService.createPersonalPlan(planDTO, clientId, startDate);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
