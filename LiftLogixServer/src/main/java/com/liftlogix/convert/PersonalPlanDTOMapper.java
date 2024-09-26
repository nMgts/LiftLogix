package com.liftlogix.convert;

import com.liftlogix.dto.PersonalPlanDTO;
import com.liftlogix.models.plans.Mesocycle;
import com.liftlogix.models.plans.Microcycle;
import com.liftlogix.models.plans.PersonalPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ClientDTOMapper.class, MesocycleDTOMapper.class})
public interface PersonalPlanDTOMapper {

    @Mapping(source = "client", target = "client", qualifiedByName = "mapEntityToDTO")
    @Mapping(source = "mesocycles", target = "length", qualifiedByName = "mapMesocyclesToLength")
    PersonalPlanDTO mapEntityToDTO(PersonalPlan plan);

    @Mapping(source = "client", target = "client", qualifiedByName = "mapDTOToEntity")
    PersonalPlan mapDTOToEntity(PersonalPlanDTO planDTO);

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
