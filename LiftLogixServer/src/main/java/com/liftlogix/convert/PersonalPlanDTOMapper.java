package com.liftlogix.convert;

import com.liftlogix.dto.PersonalPlanDTO;
import com.liftlogix.models.Mesocycle;
import com.liftlogix.models.PersonalPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ClientDTOMapper.class, MesocycleDTOMapper.class})
public interface PersonalPlanDTOMapper {

    @Mapping(source = "client", target = "client", qualifiedByName = "mapEntityToDTO")
    PersonalPlanDTO mapEntityToDTO(PersonalPlan plan);

    @Mapping(source = "client", target = "client", qualifiedByName = "mapDTOToEntity")
    PersonalPlan mapDTOToEntity(PersonalPlanDTO planDTO);
}
