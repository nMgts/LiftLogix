package com.liftlogix.controllers;

import com.liftlogix.dto.BasicPlanDTO;
import com.liftlogix.dto.PlanDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.User;
import com.liftlogix.services.ExcelService;
import com.liftlogix.services.PlanService;
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
import java.rmi.server.ExportException;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/plans")
public class PlanController {
    private final PlanService planService;
    private final ExcelService excelService;

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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PatchMapping("/rename/{id}")
    public ResponseEntity<String> renamePlan(@PathVariable Long id, @RequestBody String name, @AuthenticationPrincipal User currentUser) {
        try {
            planService.renamePlan(id, name, currentUser);
            return ResponseEntity.ok().body("{\"message\": \"Plan renamed successfully\"}");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PatchMapping("/visibility/{id}")
    public ResponseEntity<String> changePlanVisibility(@PathVariable Long id, @RequestBody boolean visibility, @AuthenticationPrincipal User currentUser) {
        try {
            planService.changePlanVisibility(id, visibility, currentUser);
            return ResponseEntity.ok().body("{\"message\": \"Plan visibility changed successfully\"}");
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
            ByteArrayResource excelFile = excelService.exportPlanToExcel(id, currentUser);

            String filename = planService.getPlanName(id) + ".xls";

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

    @PostMapping("/copy/{id}")
    public ResponseEntity<String> duplicatePlan(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            planService.duplicatePlan(id, currentUser);
            return ResponseEntity.ok().body("{\"message\": \"Plan duplicated successfully\"}");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
