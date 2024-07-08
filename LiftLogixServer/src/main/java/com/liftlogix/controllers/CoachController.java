package com.liftlogix.controllers;

import com.liftlogix.dto.CoachDTO;
import com.liftlogix.services.CoachService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
