package com.liftlogix.convert;

import com.liftlogix.dto.OpinionDTO;
import com.liftlogix.models.Opinion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OpinionDTOMapper {

    @Mapping(source = "coach.id", target = "coach_id")
    @Mapping(source = "client.id", target = "coach_id")
    OpinionDTO mapEntityToDTO(Opinion opinion);

    @Mapping(target = "coach", ignore = true)
    @Mapping(target = "client", ignore = true)
    Opinion mapDTOToEntity(OpinionDTO dto);
}
