package com.liftlogix.mappers;

import com.liftlogix.convert.UserDTOMapper;
import com.liftlogix.dto.UserDTO;
import com.liftlogix.models.users.Admin;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.models.users.User;
import com.liftlogix.types.Role;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.junit.jupiter.api.Assertions.*;

public class UserDTOMapperTest {

    private final UserDTOMapper userDTOMapper = Mappers.getMapper(UserDTOMapper.class);

    @Test
    void mapClientToDTO_ShouldMapCorrectly() {
        Coach coach = new Coach();
        coach.setId(100L);

        Client client = new Client();
        client.setId(1L);
        client.setEmail("client@example.com");
        client.setRole(Role.CLIENT);
        client.setCoach(coach);

        UserDTO userDTO = userDTOMapper.mapClientToDTO(client);

        assertNotNull(userDTO);
        assertEquals(1L, userDTO.getId());
        assertEquals("client@example.com", userDTO.getEmail());
        assertEquals(Role.CLIENT.name(), userDTO.getRole());
        assertEquals(100L, userDTO.getCoach_id());
        assertTrue(userDTO.getAssignedToCoach());
    }

    @Test
    void mapCoachToDTO_ShouldMapCorrectly() {
        Coach coach = new Coach();
        coach.setId(2L);
        coach.setEmail("coach@example.com");
        coach.setRole(Role.COACH);

        UserDTO userDTO = userDTOMapper.mapCoachToDTO(coach);

        assertNotNull(userDTO);
        assertEquals(2L, userDTO.getId());
        assertEquals("coach@example.com", userDTO.getEmail());
        assertEquals(Role.COACH.name(), userDTO.getRole());
        assertNull(userDTO.getCoach_id());
        assertNull(userDTO.getAssignedToCoach());
    }

    @Test
    void mapAdminToDTO_ShouldMapCorrectly() {
        Admin admin = new Admin();
        admin.setId(3L);
        admin.setEmail("admin@example.com");
        admin.setRole(Role.ADMIN);

        UserDTO userDTO = userDTOMapper.mapAdminToDTO(admin);

        assertNotNull(userDTO);
        assertEquals(3L, userDTO.getId());
        assertEquals("admin@example.com", userDTO.getEmail());
        assertEquals(Role.ADMIN.name(), userDTO.getRole());
        assertNull(userDTO.getCoach_id());
        assertNull(userDTO.getAssignedToCoach());
    }

    @Test
    void mapUserDTOToUser_ShouldReturnCorrectUserType() {
        UserDTO clientDTO = new UserDTO();
        clientDTO.setRole(Role.CLIENT.name());

        User client = userDTOMapper.mapUserDTOToUser(clientDTO);
        assertTrue(client instanceof Client);

        UserDTO coachDTO = new UserDTO();
        coachDTO.setRole(Role.COACH.name());

        User coach = userDTOMapper.mapUserDTOToUser(coachDTO);
        assertTrue(coach instanceof Coach);

        UserDTO adminDTO = new UserDTO();
        adminDTO.setRole(Role.ADMIN.name());

        User admin = userDTOMapper.mapUserDTOToUser(adminDTO);
        assertTrue(admin instanceof Admin);
    }

    @Test
    void mapUserDTOToUser_UnknownRole_ShouldThrowException() {
        UserDTO unknownDTO = new UserDTO();
        unknownDTO.setRole("UNKNOWN_ROLE");

        Exception exception = assertThrows(IllegalArgumentException.class, () -> userDTOMapper.mapUserDTOToUser(unknownDTO));

        assertEquals("Unknown role: UNKNOWN_ROLE", exception.getMessage());
    }

    @Test
    void isAssignedToCoach_ShouldReturnTrue_WhenCoachExists() {
        Coach coach = new Coach();
        assertTrue(userDTOMapper.isAssignedToCoach(coach));
    }

    @Test
    void isAssignedToCoach_ShouldReturnFalse_WhenCoachIsNull() {
        assertFalse(userDTOMapper.isAssignedToCoach(null));
    }
}
