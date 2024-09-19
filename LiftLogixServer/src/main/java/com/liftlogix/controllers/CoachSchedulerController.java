package com.liftlogix.controllers;

import com.liftlogix.models.User;
import com.liftlogix.services.CoachSchedulerService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scheduler")
@AllArgsConstructor
public class CoachSchedulerController {
    private final CoachSchedulerService coachSchedulerService;

    @GetMapping()
    public ResponseEntity<?> getCoachScheduler(@AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.ok().body(coachSchedulerService.getCoachScheduler(currentUser));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
