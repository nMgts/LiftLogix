package com.liftlogix.convert;

import com.liftlogix.dto.BasicPlanDTO;
import com.liftlogix.models.Mesocycle;
import com.liftlogix.models.Microcycle;
import com.liftlogix.models.Plan;
import com.liftlogix.models.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BasicPlanDTOMapper {

    @Mappings({
            @Mapping(source = "author", target = "author", qualifiedByName = "mapAuthorToName"),
            @Mapping(source = "mesocycles", target = "length", qualifiedByName = "mapMesocyclesToLength")
    })
    BasicPlanDTO mapEntityToDTO(Plan plan);

    @Named("mapAuthorToName")
    default String mapAuthorToName(User author) {
        return author.getFirst_name() + " " + author.getLast_name();
    }

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
