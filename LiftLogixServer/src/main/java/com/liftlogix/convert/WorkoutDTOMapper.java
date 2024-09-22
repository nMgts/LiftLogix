package com.liftlogix.convert;

import com.liftlogix.dto.WorkoutDTO;
import com.liftlogix.dto.WorkoutUnitDTO;
import com.liftlogix.models.Workout;
import com.liftlogix.models.WorkoutUnit;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WorkoutExerciseDTOMapper.class})
public interface WorkoutDTOMapper {

    @Mapping(source = "workoutExercises", target = "workoutExercises")
    WorkoutDTO mapEntityToDTO(Workout workout);

    @Mapping(source = "workoutExercises", target = "workoutExercises")
    Workout mapDTOToEntity(WorkoutDTO workoutDTO);
}
