package com.liftlogix.services;

import com.liftlogix.convert.DietDTOMapper;
import com.liftlogix.dto.DietDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.Diet;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.User;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.DietRepository;
import com.liftlogix.repositories.UserRepository;
import com.liftlogix.types.Role;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class DietService {
    private final DietRepository dietRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final DietDTOMapper dietDTOMapper;

    public DietDTO getClientDiet(long clientId, Authentication authentication) {

        if (!checkAccess(authentication, clientId)) {
            throw new AuthorizationException("You are not authorized");
        }

        Diet diet = dietRepository.findByClientId(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Diet not found"));

        return dietDTOMapper.mapEntityToDTO(diet);
    }

    public DietDTO updateDiet(DietDTO dietDTO, Authentication authentication) {

        long clientId = dietDTO.getClient_id();
        if (!checkAccess(authentication, clientId)) {
            throw new AuthorizationException("You are not authorized");
        }

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));
        Diet diet = dietDTOMapper.mapDTOToEntity(dietDTO);
        diet.setClient(client);

        dietRepository.save(diet);
        return dietDTO;
    }

    public void deleteDiet(long clientId) {
        Optional<Diet> diet = dietRepository.findByClientId(clientId);
        diet.ifPresent(dietRepository::delete);
    }

    private boolean checkAccess(Authentication authentication, long clientId) {

        Client client = clientRepository.findById(clientId).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new EntityNotFoundException("User not found"));

        if (user.getRole() == Role.COACH) {
            return client.getCoach().getId() == user.getId();
        } else if (user.getRole() == Role.ADMIN) return true;
        else {
            return user.getId() == client.getId();
        }
    }
}
