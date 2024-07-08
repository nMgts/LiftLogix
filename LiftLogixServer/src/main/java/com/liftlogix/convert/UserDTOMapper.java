package com.liftlogix.convert;

import com.liftlogix.dto.UserDTO;
import com.liftlogix.models.Admin;
import com.liftlogix.models.Client;
import com.liftlogix.models.Coach;
import com.liftlogix.models.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserDTOMapper {

    @Mappings({
            @Mapping(target = "assignedToCoach", ignore = true),
            @Mapping(target = "coach_id", ignore = true) // Ignoruj coach_id dla ogólnego User
    })
    UserDTO mapUserToDTO(User user);

    @AfterMapping
    default void setAssignedToCoachAndCoachId(User user, @MappingTarget UserDTO userDTO) {
        if (user instanceof Client client) {
            userDTO.setAssignedToCoach(client.getCoach() != null);
            if (client.getCoach() != null) {
                userDTO.setCoach_id(client.getCoach().getId());
            } else {
                userDTO.setCoach_id(-1L);
            }
        } else {
            userDTO.setAssignedToCoach(null);
        }
    }

    Client mapDTOToClient(UserDTO dto);
    Coach mapDTOToCoach(UserDTO dto);
    Admin mapDTOtoAdmin(UserDTO dto);
}
