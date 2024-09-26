package com.liftlogix.convert;

import com.liftlogix.dto.WorkoutExerciseDTO;
import com.liftlogix.models.exercises.Exercise;
import com.liftlogix.models.plans.WorkoutExercise;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = {BreakDTOMapper.class})
public interface WorkoutExerciseDTOMapper {

    @Mapping(source = "exercise.id", target = "exerciseId")
    @Mapping(source = "exercise.name", target = "exerciseName")
    @Mapping(source = "exercise.exercise_type", target = "exerciseType")
    @Mapping(source = "breakTime", target = "breakTime")
    WorkoutExerciseDTO mapEntityToDTO(WorkoutExercise workoutExercise);

    @Mapping(source = "exerciseId", target = "exercise", qualifiedByName = "mapExerciseIdToExercise")
    @Mapping(source = "breakTime", target = "breakTime")
    WorkoutExercise mapDTOToEntity(WorkoutExerciseDTO workoutExerciseDTO);

    @Named("mapExerciseIdToExercise")
    default Exercise mapExerciseIdToExercise(Long exerciseId) {
        if (exerciseId == null) {
            return null;
        }
        Exercise exercise = new Exercise();
        exercise.setId(exerciseId);
        return exercise;
    }
}
