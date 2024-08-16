package com.liftlogix.controllers;

import com.liftlogix.dto.ResultDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.services.ResultService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/result")
@AllArgsConstructor
public class ResultController {
    private final ResultService resultService;

    @GetMapping("/{client_id}")
    public ResponseEntity<?> getAllResults(@PathVariable long client_id, Authentication authentication) {
        try {
            return ResponseEntity.ok(resultService.getAllResults(client_id, authentication));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/current/{client_id}")
    public ResponseEntity<?> getCurrentResult(@PathVariable long client_id, Authentication authentication) {
        try {
            ResultDTO result = resultService.getCurrentResult(client_id, authentication);
            return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PostMapping("/add/{client_id}")
    public ResponseEntity<?> addResult(
            @PathVariable long client_id,
            @RequestParam(required = false) Double benchpress,
            @RequestParam(required = false) Double deadlift,
            @RequestParam(required = false) Double squat,
            Authentication authentication
    ) {
        try {
            ResultDTO result = resultService.addResult(client_id, benchpress, deadlift, squat, authentication);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateResult(@RequestBody ResultDTO result, Authentication authentication) {
        try {
            return ResponseEntity.ok(resultService.updateResult(result, authentication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteResult(@RequestParam long id, Authentication authentication) {
        try {
            resultService.deleteResult(id, authentication);
            return ResponseEntity.ok().body("{\"message\": \"Result deleted successfully\"}");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
