package com.liftlogix.convert;

import com.liftlogix.dto.MesocycleDTO;
import com.liftlogix.models.Mesocycle;
import com.liftlogix.models.Plan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {MicrocycleDTOMapper.class})
public interface MesocycleDTOMapper {

    @Mapping(source = "microcycles", target = "microcycles")
    MesocycleDTO mapEntityToDTO(Mesocycle mesocycle);

    @Mapping(source = "microcycles", target = "microcycles")
    Mesocycle mapDTOToEntity(MesocycleDTO mesocycleDTO);
}
