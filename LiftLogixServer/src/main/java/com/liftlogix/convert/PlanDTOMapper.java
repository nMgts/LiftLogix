package com.liftlogix.convert;

import com.liftlogix.dto.PlanDTO;
import com.liftlogix.models.Mesocycle;
import com.liftlogix.models.Plan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserDTOMapper.class, MesocycleDTOMapper.class})
public interface PlanDTOMapper {

    @Mapping(source = "author", target = "author", qualifiedByName = "mapUserToDTO")
    PlanDTO mapEntityToDTO(Plan plan);

    @Mapping(source = "author", target = "author", qualifiedByName = "mapUserDTOToUser")
    Plan mapDTOToEntity(PlanDTO planDTO);

    default Plan mapDTOToEntityWithPlanAssociation(PlanDTO planDTO) {
        Plan plan = mapDTOToEntity(planDTO);

        if (plan.getMesocycles() != null) {
            for (Mesocycle mesocycle : plan.getMesocycles()) {
                mesocycle.setPlan(plan);
            }
        }

        return plan;
    }
}

