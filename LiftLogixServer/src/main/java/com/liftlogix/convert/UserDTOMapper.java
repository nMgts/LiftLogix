package com.liftlogix.convert;

import com.liftlogix.dto.UserDTO;
import com.liftlogix.models.Admin;
import com.liftlogix.models.Client;
import com.liftlogix.models.Coach;
import com.liftlogix.models.User;
import com.liftlogix.types.Role;
import org.mapstruct.*;

import java.util.Objects;

@Mapper(componentModel = "spring")
public interface UserDTOMapper {

    @Mappings({
            @Mapping(target = "assignedToCoach", ignore = true),
            @Mapping(target = "coach_id", ignore = true)
    })
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
            Client client = new Client();
            // mapuj pozostałe pola, jeśli są
            return client;
        } else if (Objects.equals(userDTO.getRole(), Role.COACH.name())) {
            Coach coach = new Coach();
            // mapuj pozostałe pola, jeśli są
            return coach;
        } else if (Objects.equals(userDTO.getRole(), Role.ADMIN.name())) {
            Admin admin = new Admin();
            // mapuj pozostałe pola, jeśli są
            return admin;
        } else {
            throw new IllegalArgumentException("Unknown role: " + userDTO.getRole());
        }
    }

    @Named("mapUserToUserDTO")
    default UserDTO mapUserToUserDTO(User user) {
        if (user instanceof Client) {
            return mapClientToDTO((Client) user);
        } else if (user instanceof Coach) {
            return mapCoachToDTO((Coach) user);
        } else if (user instanceof Admin) {
            return mapAdminToDTO((Admin) user);
        } else {
            throw new IllegalArgumentException("Unknown user type: " + user.getClass());
        }
    }

    @Named("isAssignedToCoach")
    default Boolean isAssignedToCoach(Coach coach) {
        return coach != null;
    }
}
