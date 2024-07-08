package com.liftlogix.convert;

import com.liftlogix.dto.ApplicationDTO;
import com.liftlogix.models.Application;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ApplicationDTOMapper {
    ApplicationDTO mapEntityToDTO(Application application);
    Application mapDTOToEntity(ApplicationDTO dto);
}
