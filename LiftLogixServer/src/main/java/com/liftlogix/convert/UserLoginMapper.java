package com.liftlogix.convert;

import com.liftlogix.dto.UserLoginDTO;
import com.liftlogix.models.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserLoginMapper {
    UserLoginDTO mapEntityToDTO(User entity);
    User mapDTOToEntity(UserLoginDTO dto);
}
