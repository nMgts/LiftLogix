package com.liftlogix.convert;

import com.liftlogix.dto.ClientDTO;
import com.liftlogix.models.Client;
import org.mapstruct.Mapper;

import java.util.Base64;

@Mapper(componentModel = "spring")
public interface ClientDTOMapper {
    ClientDTO mapEntityToDTO(Client client);

    default String map(byte[] image) {
        if (image != null) {
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(image);
        }
        return null;
    }
}
