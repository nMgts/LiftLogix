package com.liftlogix.convert;

import com.liftlogix.dto.OpinionDTO;
import com.liftlogix.models.Opinion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OpinionDTOMapper {

    @Mapping(source = "coach.id", target = "coachId")
    @Mapping(source = "client.id", target = "clientId")
    OpinionDTO mapEntityToDTO(Opinion opinion);

    @Mapping(target = "coach", ignore = true)
    @Mapping(target = "client", ignore = true)
    Opinion mapDTOToEntity(OpinionDTO dto);
}
