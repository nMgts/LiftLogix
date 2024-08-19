package com.liftlogix.controllers;

import com.liftlogix.dto.BasicPlanDTO;
import com.liftlogix.dto.PlanDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.User;
import com.liftlogix.services.PlanService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
        try {
            return planService.savePlan(planDTO, currentUser);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/my")
    public List<BasicPlanDTO> getMyBasicPlans(@AuthenticationPrincipal User currentUser) {
        return planService.getBasicPlansByAuthor(currentUser);
    }

    @GetMapping("/public")
    public List<BasicPlanDTO> getBasicPublicPlans() {
        return planService.getBasicPublicPlans();
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<?> getPlanDetails(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.ok().body(planService.getPlanDetails(id, currentUser));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            planService.deletePlan(id, currentUser);
            return ResponseEntity.ok().body("{\"message\": \"Plan deleted successfully\"}");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/add-to-my-plans/{id}")
    public ResponseEntity<?> addToMyPlans(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            planService.addToMyPlans(id, currentUser);
            return ResponseEntity.ok().body("{\"message\": \"Plan saved in myPlans\"}");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/edit")
    public ResponseEntity<?> editPlan(@RequestBody PlanDTO planDTO, @AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.ok().body(planService.editPlan(planDTO, currentUser));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
