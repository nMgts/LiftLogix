package com.liftlogix.convert;

import com.liftlogix.dto.UserDTO;
import com.liftlogix.models.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserDTOMapper {
    UserDTO mapEntityToDTO(User entity);
    User mapDTOToEntity(UserDTO dto);
}
