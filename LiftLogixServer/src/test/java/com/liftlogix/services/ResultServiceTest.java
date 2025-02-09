package com.liftlogix.services;

import com.liftlogix.convert.ResultDTOMapper;
import com.liftlogix.dto.ResultDTO;
import com.liftlogix.models.Result;
import com.liftlogix.models.users.Admin;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.ResultRepository;
import com.liftlogix.repositories.UserRepository;
import com.liftlogix.types.Role;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResultServiceTest {

    @Mock
    private ResultRepository resultRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ResultDTOMapper resultDTOMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ResultService resultService;

    private Client client;
    private Coach coach;
    private Admin admin;
    private Client unauthorizedUser;
    private Result result;
    private ResultDTO resultDTO;

    @BeforeEach
    void setUp() {
        coach = new Coach();
        coach.setId(1L);
        coach.setEmail("coach@example.com");
        coach.setRole(Role.COACH);

        admin = new Admin();
        admin.setId(1L);
        admin.setEmail("admin@example.com");
        admin.setRole(Role.ADMIN);

        unauthorizedUser = new Client();
        unauthorizedUser.setId(2L);
        unauthorizedUser.setEmail("unauthorized@example.com");
        unauthorizedUser.setRole(Role.CLIENT);

        client = new Client();
        client.setId(1L);
        client.setEmail("client@example.com");
        client.setCoach(coach);

        result = new Result();
        result.setId(1L);
        result.setClient(client);
        result.setDate(LocalDate.now());
        result.setBenchpress(100.0);
        result.setDeadlift(150.0);
        result.setSquat(120.0);

        resultDTO = new ResultDTO();
        resultDTO.setId(1L);
        resultDTO.setClient_id(1L);
        resultDTO.setDate(LocalDate.now());
        resultDTO.setBenchpress(100.0);
        resultDTO.setDeadlift(150.0);
        resultDTO.setSquat(120.0);
    }

    @Test
    void getAllResults_AuthorizedUser_ReturnsResults() {
        when(authentication.getName()).thenReturn("coach@example.com");
        when(userRepository.findByEmail("coach@example.com")).thenReturn(Optional.of(coach));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(resultRepository.findByClientId(1L)).thenReturn(List.of(result));
        when(resultDTOMapper.mapEntityToDTO(result)).thenReturn(resultDTO);

        List<ResultDTO> results = resultService.getAllResults(1L, authentication);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(resultRepository, times(1)).findByClientId(1L);
    }

    @Test
    void getAllResults_ClientNotFound_ThrowsException() {
        when(clientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> resultService.getAllResults(1L, authentication));
    }

    @Test
    void addResult_ValidData_ReturnsResultDTO() {
        when(authentication.getName()).thenReturn("coach@example.com");
        when(userRepository.findByEmail("coach@example.com")).thenReturn(Optional.of(coach));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(resultRepository.findByClientIdAndDate(1L, resultDTO.getDate())).thenReturn(Optional.empty());
        when(resultDTOMapper.mapEntityToDTO(any(Result.class))).thenReturn(resultDTO);

        ResultDTO savedResult = resultService.addResult(1L, resultDTO, authentication);

        assertNotNull(savedResult);
        verify(resultRepository, times(1)).save(any(Result.class));
    }

    @Test
    void addResult_ClientNotFound_ThrowsException() {
        when(clientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> resultService.addResult(1L, resultDTO, authentication));
    }

    @Test
    void updateResult_ValidData_ReturnsUpdatedResult() {
        when(authentication.getName()).thenReturn("coach@example.com");
        when(userRepository.findByEmail("coach@example.com")).thenReturn(Optional.of(coach));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(resultRepository.findById(1L)).thenReturn(Optional.of(result));
        when(resultDTOMapper.mapEntityToDTO(any(Result.class))).thenReturn(resultDTO);

        ResultDTO updatedResult = resultService.updateResult(resultDTO, authentication);

        assertNotNull(updatedResult);
        verify(resultRepository, times(1)).save(any(Result.class));
    }

    @Test
    void deleteResult_ClientNotFound_ThrowsException() {
        when(resultRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> resultService.deleteResult(1L, authentication));
    }
}
