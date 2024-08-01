package com.liftlogix.services;

import com.liftlogix.convert.ExerciseDTOMapper;
import com.liftlogix.dto.ExerciseDTO;
import com.liftlogix.exceptions.DuplicateExerciseNameException;
import com.liftlogix.models.Exercise;
import com.liftlogix.repositories.ExerciseRepository;
import com.liftlogix.types.BodyPart;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;
    private final ExerciseDTOMapper exerciseDTOMapper;

    public Exercise getExerciseDetails(long id) {
        return exerciseRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Exercise not found"));
    }

    public List<ExerciseDTO> getAllExercises() {
        List<Exercise> exercises = exerciseRepository.findAll();
        return exercises.stream()
                .map(exerciseDTOMapper::mapExerciseToDTO)
                .collect(Collectors.toList());
    }

    public Exercise addExercise(String name, String description, String url,
                                MultipartFile image, Set<BodyPart> bodyParts) throws IOException {
        if (exerciseRepository.existsByName(name)) {
            throw new DuplicateExerciseNameException("Exercise with name " + name + " already exists.");
        }

        try {
            Exercise exercise = new Exercise();
            exercise.setName(name);
            System.out.println("1");
            exercise.setDescription(description);
            System.out.println("2");
            exercise.setUrl(url);
            System.out.println("3");
            if (image != null) {
                exercise.setImage(image.getBytes());
            }
            System.out.println("4");
            exercise.setBody_parts(bodyParts);
            System.out.println("5");
            return exerciseRepository.save(exercise);
        } catch (IOException e) {
            throw new IOException("Failed to process the image file");
        }
    }
}
