package com.liftlogix.convert;

import com.liftlogix.dto.DietDTO;
import com.liftlogix.models.Diet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DietDTOMapper {

    @Mapping(source = "client.id", target = "client_id")
    DietDTO mapEntityToDTO(Diet diet);

    @Mapping(target = "client", ignore = true)
    Diet mapDTOToEntity(DietDTO dto);
}
