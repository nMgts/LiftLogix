package com.liftlogix.convert;

import com.liftlogix.dto.MicrocycleDTO;
import com.liftlogix.models.Microcycle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WorkoutDTOMapper.class, WorkoutUnitDTOMapper.class})
public interface MicrocycleDTOMapper {

    @Mapping(source = "workouts", target = "workouts")
    @Mapping(source = "workoutUnits", target = "workoutUnits")
    MicrocycleDTO mapEntityToDTO(Microcycle microcycle);

    @Mapping(source = "workouts", target = "workouts")
    @Mapping(source = "workoutUnits", target = "workoutUnits")
    Microcycle mapDTOToEntity(MicrocycleDTO microcycleDTO);
}
