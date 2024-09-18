package com.liftlogix.controllers;

import com.liftlogix.dto.BasicPersonalPlanDTO;
import com.liftlogix.dto.PersonalPlanDTO;
import com.liftlogix.services.PersonalPlanService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personal-plan")
@AllArgsConstructor
public class PersonalPlanController {
    private final PersonalPlanService personalPlanService;

    @GetMapping("/all/{clientId}")
    public List<BasicPersonalPlanDTO> getAllClientPlans(@PathVariable Long clientId) {
        return personalPlanService.getAllClientPlans(clientId);
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<?> getPlanDetails(@PathVariable Long id) {
        try {
            return ResponseEntity.ok().body(personalPlanService.getPlanDetails(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

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
            @RequestBody PersonalPlanDTO plan) {
        try {
            PersonalPlanDTO createdPlan = personalPlanService.createPersonalPlan(plan);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePersonalPlan(@PathVariable Long id) {
        try {
            personalPlanService.deletePlan(id);
            return ResponseEntity.ok().body("{\"message\": \"Personal plan deleted successfully\"}");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/workout/{workout_id}")
    public ResponseEntity<?> getPersonalPlanByWorkoutId(@PathVariable Long workout_id) {
        try {
            PersonalPlanDTO personalPlanDTO = personalPlanService.getPersonalPlanByWorkoutId(workout_id);
            return ResponseEntity.ok().body(personalPlanDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
