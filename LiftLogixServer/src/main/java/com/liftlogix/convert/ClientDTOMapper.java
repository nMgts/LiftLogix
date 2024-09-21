package com.liftlogix.convert;

import com.liftlogix.dto.ClientDTO;
import com.liftlogix.models.Client;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.Base64;

@Mapper(componentModel = "spring")
public interface ClientDTOMapper {

    @Named("mapEntityToDTO")
    ClientDTO mapEntityToDTO(Client client);

    @Named("mapDTOToEntity")
    Client mapDTOToEntity(ClientDTO dto);

    default String map(byte[] image) {
        if (image != null) {
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(image);
        }
        return null;
    }

    default byte[] map(String image) {
        if (image != null && image.startsWith("data:image/png;base64,")) {
            return Base64.getDecoder().decode(image.substring("data:image/png;base64,".length()));
        }
        return null;
    }
}
