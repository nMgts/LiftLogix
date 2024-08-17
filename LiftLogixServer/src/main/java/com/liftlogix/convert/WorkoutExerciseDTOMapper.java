package com.liftlogix.convert;

import com.liftlogix.dto.WorkoutExerciseDTO;
import com.liftlogix.models.WorkoutExercise;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ExerciseDTOMapper.class, BreakDTOMapper.class})
public interface WorkoutExerciseDTOMapper {

    @Mapping(source = "breakTime", target = "breakTime")
    WorkoutExerciseDTO mapEntityToDTO(WorkoutExercise workoutExercise);

    @Mapping(source = "breakTime", target = "breakTime")
    WorkoutExercise mapDTOToEntity(WorkoutExerciseDTO workoutExerciseDTO);
}
