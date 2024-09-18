package com.liftlogix.controllers;

import com.liftlogix.dto.ChangeDateRequest;
import com.liftlogix.services.WorkoutService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/workout")
@AllArgsConstructor
public class WorkoutController {
    private final WorkoutService workoutService;

    /*
    @GetMapping("/get/{id}")
    public ResponseEntity<?> getWorkout(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(workoutService.getWorkout(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
    */

    @PatchMapping("/toggle-individual/{id}")
    public ResponseEntity<String> toggleIndividual(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        try {
            workoutService.toggleIndividual(id, date);
            return ResponseEntity.ok().body("{\"message\": \"Workout individual status toggled\"}");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }


    @PutMapping("/set-date")
    public ResponseEntity<?> changeDate(@RequestBody ChangeDateRequest request) {
        try {
            return ResponseEntity.ok(workoutService.changeDate(request.getId(), request.getOldDate(), request.getNewDate()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
