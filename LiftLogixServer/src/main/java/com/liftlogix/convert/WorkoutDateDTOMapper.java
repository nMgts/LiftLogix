package com.liftlogix.convert;

import com.liftlogix.dto.WorkoutDateDTO;
import com.liftlogix.models.WorkoutDate;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WorkoutDateDTOMapper {

    WorkoutDateDTO mapEntityToDTO(WorkoutDate workoutDate);

    WorkoutDate mapDTOToEntity(WorkoutDateDTO workoutDateDTO);
}
