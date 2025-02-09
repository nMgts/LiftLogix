package com.liftlogix.mappers;

import com.liftlogix.convert.*;
import com.liftlogix.dto.WorkoutExerciseDTO;
import com.liftlogix.models.plans.WorkoutExercise;
import com.liftlogix.dto.ExerciseDTO;
import com.liftlogix.dto.BreakDTO;
import com.liftlogix.models.exercises.Exercise;
import com.liftlogix.models.plans.Break;
import org.junit.jupiter.api.Test;
import com.liftlogix.types.TimeUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class WorkoutExerciseDTOMapperTest {

    @Autowired
    private WorkoutExerciseDTOMapper workoutExerciseDTOMapper;

    @Test
    public void shouldMapEntityToDTO() {
        // Given
        WorkoutExercise entity = new WorkoutExercise();
        entity.setId(1L);
        Exercise exercise = new Exercise();
        exercise.setId(2L);
        exercise.setName("a");
        entity.setExercise(exercise);
        entity.setSeries(3);
        entity.setRepetitionsFrom(4);
        entity.setRepetitionsTo(5);
        entity.setWeight(6.0);
        entity.setPercentage(7.0);
        entity.setTempo("8");
        entity.setRpe(9d);
        Break breakTime = new Break();
        breakTime.setValue(10);
        breakTime.setUnit(TimeUnit.min);
        entity.setBreakTime(breakTime);

        // When
        WorkoutExerciseDTO dto = workoutExerciseDTOMapper.mapEntityToDTO(entity);

        // Then
        assertEquals(1L, dto.getId());
        assertEquals(2L, dto.getExerciseId());
        assertEquals(3, dto.getSeries());
        assertEquals(4, dto.getRepetitionsFrom());
        assertEquals(5, dto.getRepetitionsTo());
        assertEquals(6.0, dto.getWeight());
        assertEquals(7.0, dto.getPercentage());
        assertEquals("8", dto.getTempo());
        assertEquals(9, dto.getRpe());
        assertEquals(10, dto.getBreakTime().getValue());
        assertEquals("min", dto.getBreakTime().getUnit()); // testuje mapowanie enuma na stringa
    }

    @Test
    public void shouldMapDTOToEntity() {
        // Given
        WorkoutExerciseDTO dto = new WorkoutExerciseDTO();
        dto.setId(1L);
        ExerciseDTO exerciseDTO = new ExerciseDTO();
        exerciseDTO.setId(2L);
        exerciseDTO.setName("abc");
        dto.setExerciseId(2L);
        dto.setSeries(3);
        dto.setRepetitionsFrom(4);
        dto.setRepetitionsTo(5);
        dto.setWeight(6.0);
        dto.setPercentage(7.0);
        dto.setTempo("8");
        dto.setRpe(9d);
        BreakDTO breakDTO = new BreakDTO();
        breakDTO.setValue(10);
        breakDTO.setUnit("min"); // testuje mapowanie stringa na enum
        dto.setBreakTime(breakDTO);

        // When
        WorkoutExercise entity = workoutExerciseDTOMapper.mapDTOToEntity(dto);

        // Then
        assertEquals(1L, entity.getId());
        assertEquals(2L, entity.getExercise().getId());
        assertEquals(3, entity.getSeries());
        assertEquals(4, entity.getRepetitionsFrom());
        assertEquals(5, entity.getRepetitionsTo());
        assertEquals(6.0, entity.getWeight());
        assertEquals(7.0, entity.getPercentage());
        assertEquals("8", entity.getTempo());
        assertEquals(9, entity.getRpe());
        assertEquals(10, entity.getBreakTime().getValue());
        assertEquals(TimeUnit.min, entity.getBreakTime().getUnit()); // testuje mapowanie enuma na stringa
    }
}
