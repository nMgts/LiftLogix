package com.liftlogix.convert;

import com.liftlogix.dto.ClientDTO;
import com.liftlogix.models.Client;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClientDTOMapper {
    ClientDTO mapEntityToDTO(Client client);
}
