package com.liftlogix.controllers;

import com.liftlogix.dto.ExerciseDTO;
import com.liftlogix.exceptions.DuplicateExerciseNameException;
import com.liftlogix.models.Exercise;
import com.liftlogix.services.ExerciseService;
import com.liftlogix.types.BodyPart;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
    public ResponseEntity<List<ExerciseDTO>> getAllExercises() {
        return ResponseEntity.ok(exerciseService.getAllExercises());
    }

    @PostMapping(path = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addExercise(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "url", required = false) String url,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "body_parts", required = false) String bodyParts
    ) {
        try {
            Set<BodyPart> bodyPartSet = (bodyParts != null && !bodyParts.isEmpty())
                    ? Stream.of(bodyParts.split(","))
                    .map(BodyPart::valueOf)
                    .collect(Collectors.toSet())
                    : Collections.emptySet();

            description = (description != null) ? description : "";
            url = (url != null) ? url : "";

            return ResponseEntity.ok(exerciseService.addExercise(name, description, url, image, bodyPartSet));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid body part provided.");
        } catch (DuplicateExerciseNameException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
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
