package com.liftlogix.services;

import com.liftlogix.convert.ClientDTOMapper;
import com.liftlogix.dto.ClientDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.exceptions.ClientAlreadyAssignedException;
import com.liftlogix.exceptions.ClientIsNotAssignedException;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.CoachRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ClientService {
    private final ClientRepository clientRepository;
    private final CoachRepository coachRepository;
    private final ClientDTOMapper clientDTOMapper;

    public ClientDTO findClientById(long id) {
        Client client = clientRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );
        return clientDTOMapper.mapEntityToDTO(client);
    }

    public List<ClientDTO> findAllClients() {
        List<Client> clients = clientRepository.findAll();
        return clients.stream()
                .map(clientDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    public List<ClientDTO> findMyClients(Authentication authentication) {
        String username = authentication.getName();
        Coach coach = coachRepository.findByEmail(username).orElseThrow();
        List<Client> clients = clientRepository.findByCoach(coach);
        return clients.stream()
                .map(clientDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    public int getMyClientsQuantity(Authentication authentication) {
        String username = authentication.getName();
        Coach coach = coachRepository.findByEmail(username).orElseThrow();
        List<Client> clients = clientRepository.findByCoach(coach);
        return clients.size();
    }

    public void assignClientToCoach(long client_id, long coach_id, Authentication authentication) {
        Optional<Coach> optCoach = coachRepository.findById(coach_id);
        if (optCoach.isPresent()) {
            Optional<Client> optClient = clientRepository.findById(client_id);
            Coach coach = optCoach.get();

            String username = authentication.getName();
            String role = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("");

            if (!Objects.equals(username, coach.getUsername()) && !Objects.equals(role, "ADMIN")) {
                throw new AuthorizationException("You are not authorized to assign this client");
            }

            if (optClient.isPresent()) {
                Client client = optClient.get();
                if (client.getCoach() == null) {
                    client.setCoach(coach);
                    client.setAssignedToCoach(true);
                    clientRepository.save(client);
                } else {
                    throw new ClientAlreadyAssignedException("Client already assigned");
                }
            } else {
                throw new EntityNotFoundException("Client not found");
            }
        } else {
            throw new EntityNotFoundException("Coach not found");
        }
    }

    public void unsubscribeClientFromCoach(long client_id, Authentication authentication) {
        Optional<Client> opt = clientRepository.findById(client_id);
        if (opt.isPresent()) {
            Client client = opt.get();
            if (client.getCoach() != null) {

                String username = authentication.getName();
                String role = authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .findFirst()
                        .orElse("");

                if (
                        !Objects.equals(username, client.getUsername()) &&
                        !Objects.equals(username, client.getCoach().getUsername()) &&
                        !Objects.equals(role, "ADMIN")) {
                    throw new AuthorizationException("This is not your subscription");
                }

                client.setCoach(null);
                client.setAssignedToCoach(false);
                clientRepository.save(client);
            } else {
                throw new ClientIsNotAssignedException("Client is not assigned");
            }
        }
        throw new EntityNotFoundException("Client not found");
    }
}
