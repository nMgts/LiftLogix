package com.liftlogix.controllers;

import com.liftlogix.dto.ChangeDateRequest;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.exceptions.TimeConflictException;
import com.liftlogix.models.users.User;
import com.liftlogix.services.WorkoutService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workout")
@AllArgsConstructor
public class WorkoutUnitController {
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
    public ResponseEntity<String> toggleIndividual(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            workoutService.toggleIndividual(id, currentUser);
            return ResponseEntity.ok().body("{\"message\": \"Workout individual status toggled\"}");
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (TimeConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }


    @PutMapping("/set-date")
    public ResponseEntity<?> changeDate(@RequestBody ChangeDateRequest request, @AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.ok(workoutService.changeDate(
                    request.getId(), request.getNewDate(), request.getDuration(), currentUser));
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (TimeConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
