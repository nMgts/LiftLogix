package com.liftlogix.controllers;

import com.liftlogix.dto.BasicExerciseDTO;
import com.liftlogix.dto.ExerciseDTO;
import com.liftlogix.exceptions.DuplicateExerciseNameException;
import com.liftlogix.models.ExerciseAlias;
import com.liftlogix.services.ExerciseService;
import com.liftlogix.types.BodyPart;
import com.liftlogix.types.ExerciseType;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
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
    public ResponseEntity<List<BasicExerciseDTO>> getAllExercises() {
        return ResponseEntity.ok(exerciseService.getAllExercises());
    }

    @GetMapping("/searchByAlias")
    public ResponseEntity<List<ExerciseDTO>> searchExercisesByAlias(@RequestParam String alias) {
        List<ExerciseDTO> exercises = exerciseService.searchExercisesByAlias(alias);
        return ResponseEntity.ok(exercises);
    }

    @PostMapping(path = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addExercise(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "url", required = false) String url,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "body_parts", required = false) String bodyParts,
            @RequestParam(value = "aliases", required = false) String aliases,
            @RequestParam(value = "exercise_type", required = true) String exerciseType,
            @RequestParam(value = "difficulty_factor", required = true) double difficultyFactor
    ) {
        try {
            Set<BodyPart> bodyPartSet = (bodyParts != null && !bodyParts.isEmpty())
                    ? Stream.of(bodyParts.split(","))
                    .map(BodyPart::valueOf)
                    .collect(Collectors.toSet())
                    : Collections.emptySet();

            Set<ExerciseAlias> aliasSet = (aliases != null && !aliases.isEmpty())
                    ? Stream.of(aliases.split(","))
                    .map(alias -> {
                        ExerciseAlias exerciseAlias = new ExerciseAlias();
                        exerciseAlias.setAlias(alias);
                        return exerciseAlias;
                    })
                    .collect(Collectors.toSet())
                    : Collections.emptySet();

            description = (description != null) ? description : "";
            url = (url != null) ? url : "";

            ExerciseType exerciseTypeEnum = ExerciseType.valueOf(exerciseType.toUpperCase());

            return ResponseEntity.ok(exerciseService.addExercise(
                    name, description, url, image, bodyPartSet, aliasSet, exerciseTypeEnum, difficultyFactor));
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

    @PostMapping("/images/batch")
    public ResponseEntity<Map<Long, String>> getBatchImages(@RequestBody List<Long> ids) {
        try {
            return ResponseEntity.ok(exerciseService.getBatchImagesAsBase64(ids));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
