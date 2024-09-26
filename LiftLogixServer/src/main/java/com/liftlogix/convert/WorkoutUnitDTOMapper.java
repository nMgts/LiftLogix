package com.liftlogix.convert;

import com.liftlogix.dto.WorkoutUnitDTO;
import com.liftlogix.models.plans.WorkoutUnit;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WorkoutExerciseDTOMapper.class})
public interface WorkoutUnitDTOMapper {

    @Mapping(source = "workoutExercises", target = "workoutExercises")
    WorkoutUnitDTO mapEntityToDTO(WorkoutUnit workout);

    @Mapping(source = "workoutExercises", target = "workoutExercises")
    WorkoutUnit mapDTOToEntity(WorkoutUnitDTO workoutDTO);
}
