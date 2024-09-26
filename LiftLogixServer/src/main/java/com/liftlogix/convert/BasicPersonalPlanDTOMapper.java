package com.liftlogix.convert;

import com.liftlogix.dto.BasicPersonalPlanDTO;
import com.liftlogix.models.plans.Mesocycle;
import com.liftlogix.models.plans.Microcycle;
import com.liftlogix.models.plans.PersonalPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BasicPersonalPlanDTOMapper {

    @Mapping(source = "mesocycles", target = "length", qualifiedByName = "mapMesocyclesToLength")
    BasicPersonalPlanDTO mapEntityToDTO(PersonalPlan plan);

    @Named("mapMesocyclesToLength")
    default int mapMesocyclesToLength(List<Mesocycle> mesocycles) {
        int length = 0;
        for (Mesocycle mesocycle : mesocycles) {
            for (Microcycle microcycle : mesocycle.getMicrocycles()) {
                length += microcycle.getLength();
            }
        }
        return length;
    }
}
