package com.liftlogix.services;

import com.liftlogix.convert.ExerciseDTOMapper;
import com.liftlogix.dto.ExerciseDTO;
import com.liftlogix.exceptions.DuplicateExerciseNameException;
import com.liftlogix.models.Exercise;
import com.liftlogix.models.ExerciseAlias;
import com.liftlogix.repositories.ExerciseRepository;
import com.liftlogix.types.BodyPart;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(ExerciseService.class);

    public Exercise getExerciseDetails(long id) {
        return exerciseRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Exercise not found"));
    }

    public List<ExerciseDTO> getAllExercises() {
        List<Exercise> exercises = exerciseRepository.findAll();
        for (Exercise exercise : exercises) {
            logger.info("Exercise: {}", exercise);
            for (ExerciseAlias alias : exercise.getAliases()) {
                logger.info("Alias: {}, Language: {}", alias.getAlias(), alias.getLanguage());
            }
        }
        return exercises.stream()
                .map(exerciseDTOMapper::mapExerciseToDTO)
                .collect(Collectors.toList());
    }

    public void addExercise(String name, String description, String url,
                                MultipartFile image, Set<BodyPart> bodyParts,
                                Set<ExerciseAlias> aliasSet) throws IOException {
        if (exerciseRepository.existsByName(name)) {
            throw new DuplicateExerciseNameException("Exercise with name " + name + " already exists.");
        }

        try {
            Exercise exercise = new Exercise();
            exercise.setName(name);
            exercise.setDescription(description);
            exercise.setUrl(url);
            if (image != null) {
                exercise.setImage(image.getBytes());
            }
            exercise.setBody_parts(bodyParts);

            for (ExerciseAlias alias : aliasSet) {
                alias.setExercise(exercise);
            }
            exercise.setAliases(aliasSet);

            exerciseRepository.save(exercise);
        } catch (IOException e) {
            throw new IOException("Failed to process the image file");
        }
    }
}
