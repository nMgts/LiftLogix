package com.liftlogix.controllers;

import com.liftlogix.models.Exercise;
import com.liftlogix.services.ExerciseService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/exercise")
@AllArgsConstructor
public class ExerciseController {
    private final ExerciseService exerciseService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getExerciseDetails(@PathVariable long id) {
        try {
            return ResponseEntity.ok(exerciseService.getExerciseDetails(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Exercise>> getAllExercises() {
        return ResponseEntity.ok(exerciseService.getAllExercises());
    }

    @PostMapping(path = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addExercise(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("url") String url,
            @RequestParam("image") MultipartFile image
    ) {
        try {
            return ResponseEntity.ok(exerciseService.addExercise(name, description, url, image));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<?> getImage(@PathVariable long id) {  //byte[]
        try {
            Exercise exercise = exerciseService.getExerciseDetails(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"image.jpg\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(exercise.getImage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
