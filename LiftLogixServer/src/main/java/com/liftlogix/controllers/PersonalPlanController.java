package com.liftlogix.controllers;

import com.liftlogix.dto.PersonalPlanDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.exceptions.NoActivePlanException;
import com.liftlogix.models.users.User;
import com.liftlogix.services.ExcelService;
import com.liftlogix.services.PersonalPlanService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/personal-plan")
@AllArgsConstructor
public class PersonalPlanController {
    private final PersonalPlanService personalPlanService;
    private final ExcelService excelService;

    @GetMapping("/all/{clientId}")
    public ResponseEntity<?> getAllClientPlans(@PathVariable Long clientId, @AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.ok().body(personalPlanService.getAllClientPlans(clientId, currentUser));
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<?> getPlanDetails(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.ok().body(personalPlanService.getPlanDetails(id, currentUser));
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/is-active/{clientId}")
    public ResponseEntity<?> getActivePlanByClientId(@PathVariable Long clientId, @AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.ok().body(personalPlanService.getActivePlanByClientId(clientId, currentUser));
        } catch (NoActivePlanException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PatchMapping("/deactivate/{planId}")
    public ResponseEntity<String> deactivatePlan(@PathVariable Long planId, @AuthenticationPrincipal User currentUser) {
        try {
            personalPlanService.deactivatePlan(planId, currentUser);
            return ResponseEntity.ok().body("{\"message\": \"Plan deactivated\"}");
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPersonalPlan(@RequestBody PersonalPlanDTO plan, @AuthenticationPrincipal User currentUser) {
        try {
            PersonalPlanDTO createdPlan = personalPlanService.createPersonalPlan(plan, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePersonalPlan(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            personalPlanService.deletePlan(id, currentUser);
            return ResponseEntity.ok().body("{\"message\": \"Personal plan deleted successfully\"}");
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/workout/{workout_id}")
    public ResponseEntity<?> getPersonalPlanByWorkoutId(@PathVariable Long workout_id, @AuthenticationPrincipal User currentUser) {
        try {
            PersonalPlanDTO personalPlanDTO = personalPlanService.getPersonalPlanByWorkoutId(workout_id, currentUser);
            return ResponseEntity.ok().body(personalPlanDTO);
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/edit")
    public ResponseEntity<?> editPersonalPlan(@RequestBody PersonalPlanDTO personalPlanDTO, @AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.ok().body(personalPlanService.editPlan(personalPlanDTO, currentUser));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/export/{id}")
    public ResponseEntity<?> exportPlanToExcel(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            ByteArrayResource excelFile = excelService.exportPersonalPlanToExcel(id, currentUser);

            String filename = personalPlanService.getPlanName(id) + ".xls";

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(excelFile);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
