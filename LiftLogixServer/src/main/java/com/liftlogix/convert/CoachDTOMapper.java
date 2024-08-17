package com.liftlogix.convert;

import com.liftlogix.dto.CoachDTO;
import com.liftlogix.models.Coach;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CoachDTOMapper {
    CoachDTO mapEntityToDTO(Coach coach);
    Coach mapDTOToEntity(CoachDTO dto);
}
