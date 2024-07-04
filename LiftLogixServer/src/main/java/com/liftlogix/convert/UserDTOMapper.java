package com.liftlogix.convert;

import com.liftlogix.dto.UserDTO;
import com.liftlogix.models.Client;
import com.liftlogix.models.Coach;
import com.liftlogix.models.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserDTOMapper {

    UserDTO mapUserToDTO(User user);
    Client mapDTOToClient(UserDTO dto);
    Coach mapDTOToCoach(UserDTO dto);
}
