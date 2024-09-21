package com.liftlogix.convert;

import com.liftlogix.dto.UserDTO;
import com.liftlogix.models.Admin;
import com.liftlogix.models.Client;
import com.liftlogix.models.Coach;
import com.liftlogix.models.User;
import com.liftlogix.types.Role;
import org.mapstruct.*;

import java.util.Objects;

@Mapper(componentModel = "spring", uses = {ClientDTOMapper.class, CoachDTOMapper.class, AdminDTOMapper.class})
public interface UserDTOMapper {

    @Mappings({
            @Mapping(target = "assignedToCoach", ignore = true),
            @Mapping(target = "coach_id", ignore = true)
    })
    @Named("mapUserToDTO")
    UserDTO mapUserToDTO(User user);

    @Mappings({
            @Mapping(target = "assignedToCoach", source = "coach", qualifiedByName = "isAssignedToCoach"),
            @Mapping(target = "coach_id", source = "coach.id")
    })
    UserDTO mapClientToDTO(Client client);

    @Mappings({
            @Mapping(target = "assignedToCoach", ignore = true),
            @Mapping(target = "coach_id", ignore = true)
    })
    UserDTO mapCoachToDTO(Coach coach);

    @Mappings({
            @Mapping(target = "assignedToCoach", ignore = true),
            @Mapping(target = "coach_id", ignore = true)
    })
    UserDTO mapAdminToDTO(Admin admin);

    @Named("mapUserDTOToUser")
    default User mapUserDTOToUser(UserDTO userDTO) {
        if (Objects.equals(userDTO.getRole(), Role.CLIENT.name())) {
            return new Client();
        } else if (Objects.equals(userDTO.getRole(), Role.COACH.name())) {
            return new Coach();
        } else if (Objects.equals(userDTO.getRole(), Role.ADMIN.name())) {
            return new Admin();
        } else {
            throw new IllegalArgumentException("Unknown role: " + userDTO.getRole());
        }
    }

    @Named("isAssignedToCoach")
    default Boolean isAssignedToCoach(Coach coach) {
        return coach != null;
    }
}
