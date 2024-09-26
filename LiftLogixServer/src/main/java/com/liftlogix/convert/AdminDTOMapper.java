package com.liftlogix.convert;

import com.liftlogix.dto.AdminDTO;
import com.liftlogix.models.users.Admin;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AdminDTOMapper {
    AdminDTO mapEntityToDTO(Admin admin);
    Admin mapDTOToEntity(AdminDTO dto);
}
