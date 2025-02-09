package com.liftlogix.integration;

import com.liftlogix.convert.BasicExerciseDTOMapper;
import com.liftlogix.convert.ExerciseDTOMapper;
import com.liftlogix.dto.BasicExerciseDTO;
import com.liftlogix.dto.ExerciseDTO;
import com.liftlogix.exceptions.DuplicateExerciseNameException;
import com.liftlogix.models.exercises.Exercise;
import com.liftlogix.models.exercises.ExerciseAlias;
import com.liftlogix.repositories.ExerciseRepository;
import com.liftlogix.services.ExerciseService;
import com.liftlogix.types.BodyPart;
import com.liftlogix.types.ExerciseType;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest
class ExerciseServiceIT {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ExerciseDTOMapper exerciseDTOMapper;

    @Autowired
    private BasicExerciseDTOMapper basicExerciseDTOMapper;

    private ExerciseService exerciseService;

    private String testExercise1;
    private String testExercise2;

    @BeforeEach
    void setup() {
        exerciseService = new ExerciseService(exerciseRepository, exerciseDTOMapper, basicExerciseDTOMapper);

        testExercise1 = "test_" + new Random().nextInt(100000);
        testExercise2 = "test_" + new Random().nextInt(100000);

        Exercise exercise1 = new Exercise();
        exercise1.setName(testExercise1);
        exercise1.setDescription("Basic exercise 1.");
        exercise1.setExercise_type(ExerciseType.SQUAT);
        exercise1.setBody_parts(Set.of(BodyPart.CHEST, BodyPart.TRICEPS));
        exerciseRepository.save(exercise1);

        Exercise exercise2 = new Exercise();
        exercise2.setName(testExercise2);
        exercise2.setDescription("Basic exercise 2.");
        exercise2.setExercise_type(ExerciseType.DEADLIFT);
        exercise2.setBody_parts(Set.of(BodyPart.BACK, BodyPart.BICEPS));
        exerciseRepository.save(exercise2);
    }

    @Test
    @Transactional
    void testGetExerciseDetails_Success() {
        Exercise existingExercise = exerciseRepository.findByName(testExercise1).orElseThrow();
        ExerciseDTO result = exerciseService.getExerciseDetails(existingExercise.getId());

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo(testExercise1);
        assertThat(result.getDescription()).isEqualTo("Basic exercise 1.");
    }

    @Test
    void testGetExerciseDetails_NotFound() {
        assertThatThrownBy(() -> exerciseService.getExerciseDetails(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessage("Exercise not found");
    }

    @Test
    @Transactional
    void testGetAllExercises() {
        List<BasicExerciseDTO> exercises = exerciseService.getAllExercises();

        assertThat(exercises).extracting(BasicExerciseDTO::getName)
                .contains(testExercise1, testExercise2);
    }

    @Test
    void testAddExercise_Success() throws IOException {
        String newExerciseName = "test_" + new Random().nextInt(100000);
        MockMultipartFile imageFile = new MockMultipartFile(
                "image", "test.jpg", "image/jpeg", "test image data".getBytes()
        );

        ExerciseDTO newExercise = exerciseService.addExercise(
                newExerciseName,
                "New test exercise.",
                "https://example.com/test",
                imageFile,
                Set.of(BodyPart.QUAD),
                Set.of(),
                ExerciseType.SQUAT,
                1.5
        );

        assertThat(newExercise).isNotNull();
        assertThat(newExercise.getName()).isEqualTo(newExerciseName);
    }

    @Test
    void testAddExercise_DuplicateName() {
        assertThatThrownBy(() -> exerciseService.addExercise(
                testExercise1,
                "Duplicate exercise",
                "https://example.com/duplicate",
                null,
                Set.of(BodyPart.CHEST),
                Set.of(),
                ExerciseType.SQUAT,
                1.0
        )).isInstanceOf(DuplicateExerciseNameException.class)
                .hasMessageContaining("Exercise with name " + testExercise1 + " already exists.");
    }

    @Test
    void testGetBatchImagesAsBase64() throws IOException {
        Exercise exercise1 = exerciseRepository.findByName(testExercise1).orElseThrow();
        exercise1.setImage("image1".getBytes());

        Exercise exercise2 = exerciseRepository.findByName(testExercise2).orElseThrow();
        exercise2.setImage("image2".getBytes());

        exerciseRepository.saveAll(List.of(exercise1, exercise2));

        Map<Long, String> images = exerciseService.getBatchImagesAsBase64(List.of(exercise1.getId(), exercise2.getId()));

        assertThat(images).containsKeys(exercise1.getId(), exercise2.getId());
        assertThat(images.get(exercise1.getId())).startsWith("data:image/jpeg;base64,");
        assertThat(images.get(exercise2.getId())).startsWith("data:image/jpeg;base64,");
    }
}

