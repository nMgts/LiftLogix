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

    default PersonalPlan mapDTOToEntityWithPlanAssociation(PersonalPlanDTO planDTO) {
        PersonalPlan plan = mapDTOToEntity(planDTO);

        if (plan.getMesocycles() != null) {
            for (Mesocycle mesocycle : plan.getMesocycles()) {
                mesocycle.setPersonalPlan(plan);
            }
        }

        return plan;
    }
}
