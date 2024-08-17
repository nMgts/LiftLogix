package com.liftlogix.convert;

import com.liftlogix.dto.BreakDTO;
import com.liftlogix.models.Break;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BreakDTOMapper {

    BreakDTO mapEntityToDTO(Break breakTime);

    Break mapDTOToEntity(BreakDTO breakTimeDTO);
}
