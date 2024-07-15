package com.liftlogix.controllers;

import com.liftlogix.dto.ApplicationDTO;
import com.liftlogix.exceptions.ApplicationIsNotActiveException;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.exceptions.ClientAlreadyAssignedException;
import com.liftlogix.services.ApplicationService;
import com.liftlogix.types.ApplicationStatus;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/application")
@AllArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;

    @GetMapping("/mine")
    public ResponseEntity<?> getMyApplications(Authentication authentication) {
        try {
            return ResponseEntity.ok(applicationService.getMyApplications(authentication));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createApplication(@RequestBody ApplicationDTO request, @RequestHeader("Authorization") String token) {
        try {
            ApplicationDTO createdApplication = applicationService.create(request, token);
            return ResponseEntity.ok(createdApplication);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (EntityExistsException | ClientAlreadyAssignedException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/accept/{application_id}")
    public ResponseEntity<String> acceptApplication(@PathVariable long application_id, Authentication authentication) {
        try {
            applicationService.acceptApplication(application_id, authentication);
            return ResponseEntity.ok().body("{\"message\": \"Application accepted successfully\"}");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (ClientAlreadyAssignedException | ApplicationIsNotActiveException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/reject/{application_id}")
    public ResponseEntity<String> rejectApplication(@PathVariable long application_id, Authentication authentication) {
        try {
            applicationService.rejectApplication(application_id, authentication);
            return ResponseEntity.ok().body("{\"message\": \"Application rejected successfully\"}");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (ApplicationIsNotActiveException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PostMapping("/updateStatus")
    public ResponseEntity<?> updateApplicationStatus(@RequestParam long application_id, @RequestParam ApplicationStatus status) {
        try {
            applicationService.updateStatus(application_id, status);
            return ResponseEntity.ok("Application status updated successfully");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
