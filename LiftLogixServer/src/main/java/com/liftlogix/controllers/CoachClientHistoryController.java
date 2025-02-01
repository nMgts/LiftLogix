package com.liftlogix.controllers;

import com.liftlogix.services.CoachClientHistoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coach-client-history")
@AllArgsConstructor
public class CoachClientHistoryController {
    private final CoachClientHistoryService coachClientHistoryService;

    @GetMapping("/exists")
    public ResponseEntity<?> checkHistory(@RequestParam Long coachId, Authentication authentication) {
        try {
            return ResponseEntity.ok(coachClientHistoryService.hasHistoryBetweenClientAndCoach(coachId, authentication));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
