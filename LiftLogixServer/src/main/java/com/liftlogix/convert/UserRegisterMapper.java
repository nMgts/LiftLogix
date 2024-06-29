package com.liftlogix.convert;

import com.liftlogix.dto.UserRegisterDTO;
import com.liftlogix.models.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserRegisterMapper {
    UserRegisterDTO mapEntityToDTO(User entity);
    User mapDTOToEntity(UserRegisterDTO dto);
}
