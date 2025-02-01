package com.liftlogix.controllers;

import com.liftlogix.dto.OpinionDTO;
import com.liftlogix.services.OpinionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/opinion")
public class OpinionController {
    private final OpinionService opinionService;

    @GetMapping("/all/{coachId}")
    public ResponseEntity<List<OpinionDTO>> getOpinionsByCoach(@PathVariable Long coachId) {
        List<OpinionDTO> opinions = opinionService.getOpinionsByCoach(coachId);
        return ResponseEntity.ok(opinions);
    }

    @GetMapping("/average/{coachId}")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long coachId) {
        double avgRating = opinionService.getAverageRating(coachId);
        return ResponseEntity.ok(avgRating);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addOpinion(@RequestBody OpinionDTO opinionDTO, Authentication authentication) {
        try {
            return ResponseEntity.ok(opinionService.addOpinion(opinionDTO, authentication));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
