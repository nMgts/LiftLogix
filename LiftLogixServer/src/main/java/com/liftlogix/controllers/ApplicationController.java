package com.liftlogix.controllers;

import com.liftlogix.dto.ApplicationDTO;
import com.liftlogix.models.Application;
import com.liftlogix.services.ApplicationService;
import com.liftlogix.types.ApplicationStatus;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/application")
@AllArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;

    @PostMapping("/create")
    public ResponseEntity<?> createApplication(@RequestBody ApplicationDTO request) {
        try {
            ApplicationDTO createdApplication = applicationService.create(request);
            return ResponseEntity.ok(createdApplication);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (EntityExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/updateStatus")
    public ResponseEntity<?> updateApplicationStatus(@RequestParam long application_id, @RequestParam ApplicationStatus status) {
        try {
            applicationService.updateStatus(application_id, status);
            return ResponseEntity.ok("Application status updated successfully");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
