package com.liftlogix.controllers;

import com.liftlogix.dto.ResultDTO;
import com.liftlogix.services.ResultService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/result")
@AllArgsConstructor
public class ResultController {
    private final ResultService resultService;

    @GetMapping("/{client_id}")
    public ResponseEntity<List<ResultDTO>> getAllResults(@PathVariable long client_id) {
        return ResponseEntity.ok(resultService.getAllResults(client_id));
    }

    @GetMapping("/current/{client_id}")
    public ResponseEntity<ResultDTO> getCurrentResult(@PathVariable long client_id) {
        ResultDTO result = resultService.getCurrentResult(client_id);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }

    @PostMapping("/add/{client_id}") //Trzeba zabezpieczyć aby trener tylko swojemnu klientowi
    public ResponseEntity<?> addResult(
            @PathVariable long client_id,
            @RequestParam(required = false) Double benchpress,
            @RequestParam(required = false) Double deadlift,
            @RequestParam(required = false) Double squat
    ) {
        try {
            ResultDTO result = resultService.addResult(client_id, benchpress, deadlift, squat);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
