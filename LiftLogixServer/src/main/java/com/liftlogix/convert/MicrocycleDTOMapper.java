package com.liftlogix.convert;

import com.liftlogix.dto.MicrocycleDTO;
import com.liftlogix.models.Microcycle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WorkoutDTOMapper.class})
public interface MicrocycleDTOMapper {

    @Mapping(source = "workouts", target = "workouts")
    MicrocycleDTO mapEntityToDTO(Microcycle microcycle);

    @Mapping(source = "workouts", target = "workouts")
    Microcycle mapDTOToEntity(MicrocycleDTO microcycleDTO);
}
