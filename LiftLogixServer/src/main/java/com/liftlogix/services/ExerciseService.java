package com.liftlogix.services;

import com.liftlogix.convert.BasicExerciseDTOMapper;
import com.liftlogix.convert.ExerciseDTOMapper;
import com.liftlogix.dto.BasicExerciseDTO;
import com.liftlogix.dto.ExerciseDTO;
import com.liftlogix.exceptions.DuplicateExerciseNameException;
import com.liftlogix.models.Exercise;
import com.liftlogix.models.ExerciseAlias;
import com.liftlogix.repositories.ExerciseRepository;
import com.liftlogix.types.BodyPart;
import com.liftlogix.types.ExerciseType;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.*;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;
    private final ExerciseDTOMapper exerciseDTOMapper;
    private final BasicExerciseDTOMapper basicExerciseDTOMapper;

    public ExerciseDTO getExerciseDetails(long id) {
        Exercise exercise = exerciseRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Exercise not found"));
        return exerciseDTOMapper.mapExerciseToDTO(exercise);
    }

    public List<BasicExerciseDTO> getAllExercises() {
        List<Exercise> exercises = exerciseRepository.findAll();
        return exercises.stream()
                .map(basicExerciseDTOMapper::mapExerciseToBasicDTO)
                .collect(Collectors.toList());
    }

    public List<ExerciseDTO> searchExercisesByAlias(String alias) {
        String[] keywords = alias.toLowerCase().trim().split("\\s+");

        Specification<Exercise> spec = (Root<Exercise> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Predicate predicate = cb.conjunction();
            for (String keyword : keywords) {
                Join<Exercise, ExerciseAlias> aliasJoin = root.join("aliases", JoinType.INNER);
                Predicate keywordPredicate = cb.like(cb.lower(aliasJoin.get("alias")), "%" + keyword + "%");
                predicate = cb.and(predicate, keywordPredicate);
            }
            query.distinct(true);
            return predicate;
        };

        List<Exercise> exercises = exerciseRepository.findAll(spec);

        return exercises.stream()
                .map(exerciseDTOMapper::mapExerciseToDTO)
                .collect(Collectors.toList());
    }

    public ExerciseDTO addExercise(String name, String description, String url,
                                   MultipartFile image, Set<BodyPart> bodyParts,
                                   Set<ExerciseAlias> aliasSet, ExerciseType exerciseType,
                                   double difficultyFactor) throws IOException {
        if (exerciseRepository.existsByName(name)) {
            throw new DuplicateExerciseNameException("Exercise with name " + name + " already exists.");
        }

        try {
            Exercise exercise = new Exercise();
            exercise.setName(name);
            exercise.setDescription(description);
            exercise.setUrl(url);
            exercise.setExercise_type(exerciseType);
            exercise.setDifficulty_factor(difficultyFactor);
            exercise.setCertificated(false);

            if (image != null) {
                exercise.setImage(image.getBytes());
            }
            exercise.setBody_parts(bodyParts);

            for (ExerciseAlias alias : aliasSet) {
                alias.setExercise(exercise);
            }
            exercise.setAliases(aliasSet);

            exerciseRepository.save(exercise);
            return exerciseDTOMapper.mapExerciseToDTO(exercise);
        } catch (IOException e) {
            throw new IOException("Failed to process the image file");
        }
    }

    public Map<Long, String> getBatchImagesAsBase64(List<Long> ids) {
        List<Exercise> exercises = exerciseRepository.findAllById(ids);
        return exercises.stream()
                .collect(Collectors.toMap(
                        Exercise::getId,
                        exercise -> {
                            byte[] imageBytes = exercise.getImage();
                            if (imageBytes != null) {
                                return "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(imageBytes);
                            } else {
                                return "";
                            }
                        }
                ));
    }
}
