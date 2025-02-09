package com.liftlogix.services;

import com.liftlogix.convert.DietDTOMapper;
import com.liftlogix.dto.DietDTO;
import com.liftlogix.models.Diet;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.models.users.Admin;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.DietRepository;
import com.liftlogix.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class DietServiceTest {

    @Mock
    private DietRepository dietRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DietDTOMapper dietDTOMapper;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private DietService dietService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getClientDiet_ShouldReturnDietDTO_WhenClientIsAuthorized() {
        long clientId = 1L;
        Diet diet = new Diet();
        DietDTO dietDTO = new DietDTO();
        Client client = new Client();
        client.setId(clientId);

        Client userClient = new Client();
        userClient.setId(clientId);

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userClient));
        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(dietRepository.findByClientId(clientId)).thenReturn(Optional.of(diet));
        when(dietDTOMapper.mapEntityToDTO(diet)).thenReturn(dietDTO);

        DietDTO result = dietService.getClientDiet(clientId, authentication);

        assertNotNull(result);
        verify(dietRepository).findByClientId(clientId);
    }

    @Test
    void getClientDiet_ShouldThrowException_WhenUnauthorized() {
        long clientId = 1L;
        when(authentication.getName()).thenReturn("unauthorized@example.com");
        when(userRepository.findByEmail("unauthorized@example.com")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> dietService.getClientDiet(clientId, authentication));
    }

    @Test
    void updateDiet_ShouldReturnUpdatedDietDTO_WhenClientIsAuthorized() {
        long clientId = 1L;
        DietDTO dietDTO = new DietDTO();
        dietDTO.setClient_id(clientId);

        Diet diet = new Diet();
        Client client = new Client();
        client.setId(clientId);

        Client userClient = new Client();
        userClient.setId(clientId);

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userClient));
        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(dietDTOMapper.mapDTOToEntity(dietDTO)).thenReturn(diet);

        DietDTO result = dietService.updateDiet(dietDTO, authentication);

        assertNotNull(result);
        verify(dietRepository).save(diet);
    }

    @Test
    void updateDiet_ShouldThrowException_WhenUnauthorized() {
        long clientId = 1L;
        DietDTO dietDTO = new DietDTO();
        dietDTO.setClient_id(clientId);

        when(authentication.getName()).thenReturn("unauthorized@example.com");
        when(userRepository.findByEmail("unauthorized@example.com")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> dietService.updateDiet(dietDTO, authentication));
    }

    @Test
    void deleteDiet_ShouldDeleteDiet_WhenExists() {
        long clientId = 1L;
        Diet diet = new Diet();

        when(dietRepository.findByClientId(clientId)).thenReturn(Optional.of(diet));

        dietService.deleteDiet(clientId);

        verify(dietRepository).delete(diet);
    }

    @Test
    void deleteDiet_ShouldDoNothing_WhenDietDoesNotExist() {
        long clientId = 1L;
        when(dietRepository.findByClientId(clientId)).thenReturn(Optional.empty());

        dietService.deleteDiet(clientId);

        verify(dietRepository, never()).delete(any(Diet.class));
    }
}
