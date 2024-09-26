package com.liftlogix.convert;

import com.liftlogix.dto.PlanDTO;
import com.liftlogix.models.plans.Plan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserDTOMapper.class, MesocycleDTOMapper.class})
public interface PlanDTOMapper {

    @Mapping(source = "author", target = "author", qualifiedByName = "mapUserToDTO")
    PlanDTO mapEntityToDTO(Plan plan);

    @Mapping(source = "author", target = "author", qualifiedByName = "mapUserDTOToUser")
    Plan mapDTOToEntity(PlanDTO planDTO);
}

