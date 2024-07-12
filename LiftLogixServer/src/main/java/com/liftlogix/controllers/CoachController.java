package com.liftlogix.controllers;

import com.liftlogix.dto.CoachDTO;
import com.liftlogix.models.Coach;
import com.liftlogix.services.CoachService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coach")
@AllArgsConstructor
public class CoachController {
    private final CoachService coachService;

    @GetMapping("/{id}")
    public ResponseEntity<?> findCoachById(@PathVariable long id) {
        try {
            return ResponseEntity.ok(coachService.findCoachById(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<CoachDTO>> findAllCoaches() {
        return ResponseEntity.ok(coachService.findAllCoaches());
    }

    @GetMapping("/profile")
    public ResponseEntity<CoachDTO> getProfile(Authentication authentication) {
        return ResponseEntity.ok(coachService.getProfile(authentication));
    }

    @PutMapping("/profile")
    public ResponseEntity<CoachDTO> updateProfile(@RequestBody CoachDTO coach) {
        return ResponseEntity.ok(coachService.updateProfile(coach));
    }
}
