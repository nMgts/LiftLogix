package com.liftlogix.controllers;

import com.liftlogix.models.Exercise;
import com.liftlogix.services.ExerciseService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
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
    public ResponseEntity<Exercise> getExerciseDetails(@PathVariable long id) {
        return ResponseEntity.ok(exerciseService.getExerciseDetails(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Exercise>> getAllExercises() {
        return ResponseEntity.ok(exerciseService.getAllExercises());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Exercise> addExercise(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("url") String url,
            @RequestParam("image") MultipartFile image
    ) throws IOException {
        Exercise exercise = new Exercise();
        exercise.setName(name);
        exercise.setDescription(description);
        exercise.setUrl(url);
        exercise.setImage(image.getBytes());
        return ResponseEntity.ok(exerciseService.addExercise(exercise));
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable long id) {
        Exercise exercise = exerciseService.getExerciseDetails(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"image.jpg\"")
                .contentType(MediaType.IMAGE_JPEG)
                .body(exercise.getImage());
    }
}
