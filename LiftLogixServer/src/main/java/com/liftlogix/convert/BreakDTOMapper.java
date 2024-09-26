package com.liftlogix.convert;

import com.liftlogix.dto.BreakDTO;
import com.liftlogix.models.plans.Break;
import com.liftlogix.types.TimeUnit;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface BreakDTOMapper {

    @Mapping(source = "unit", target = "unit", qualifiedByName = "timeUnitToString")
    BreakDTO mapEntityToDTO(Break breakTime);

    @Mapping(source = "unit", target = "unit", qualifiedByName = "stringToTimeUnit")
    Break mapDTOToEntity(BreakDTO breakTimeDTO);

    @Named("stringToTimeUnit")
    default TimeUnit mapStringToTimeUnit(String unit) {
        return unit != null ? TimeUnit.valueOf(unit) : null;
    }

    @Named("timeUnitToString")
    default String mapTimeUnitToString(TimeUnit unit) {
        return unit != null ? unit.name() : null;
    }
}
