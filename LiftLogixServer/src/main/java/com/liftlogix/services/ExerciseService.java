package com.liftlogix.services;

import com.liftlogix.convert.ExerciseDTOMapper;
import com.liftlogix.dto.ExerciseDTO;
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
        try {
            Exercise exercise = new Exercise();
            exercise.setName(name);
            exercise.setDescription(description);
            exercise.setUrl(url);
            exercise.setImage(image.getBytes());
            exercise.setBody_parts(bodyParts);
            return exerciseRepository.save(exercise);
        } catch (IOException e) {
            throw new IOException("Failed to process the image file");
        }
    }
}
