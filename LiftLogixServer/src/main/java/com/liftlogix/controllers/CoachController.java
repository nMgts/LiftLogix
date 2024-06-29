package com.liftlogix.controllers;

import com.liftlogix.models.Coach;
import com.liftlogix.services.CoachService;
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
    public ResponseEntity<Coach> findCoachById(@PathVariable long id) throws Exception {
        return ResponseEntity.ok(coachService.findCoachById(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Coach>> findAllCoaches() {
        return ResponseEntity.ok(coachService.findAllCoaches());
    }
}
