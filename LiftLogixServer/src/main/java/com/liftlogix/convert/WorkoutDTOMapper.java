package com.liftlogix.convert;

import com.liftlogix.dto.WorkoutDTO;
import com.liftlogix.models.Workout;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WorkoutExerciseDTOMapper.class, WorkoutDateDTOMapper.class})
public interface WorkoutDTOMapper {

    @Mapping(source = "workoutExercises", target = "workoutExercises")
    @Mapping(source = "dates", target = "dates")
    WorkoutDTO mapEntityToDTO(Workout workout);

    @Mapping(source = "workoutExercises", target = "workoutExercises")
    @Mapping(source = "dates", target = "dates")
    Workout mapDTOToEntity(WorkoutDTO workoutDTO);
}
