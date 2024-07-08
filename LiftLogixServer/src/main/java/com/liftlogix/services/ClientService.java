package com.liftlogix.services;

import com.liftlogix.convert.ClientDTOMapper;
import com.liftlogix.dto.ClientDTO;
import com.liftlogix.models.Client;
import com.liftlogix.models.Coach;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.util.JWTUtils;
import lombok.AllArgsConstructor;
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
    private final JWTUtils jwtUtils;

    public List<ClientDTO> findAllClients() {
        List<Client> clients = clientRepository.findAll();
        return clients.stream()
                .map(clientDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    public String assignClientToCoach(long client_id, long coach_id, String token) {
        Optional<Coach> optCoach = coachRepository.findById(coach_id);
        if (optCoach.isPresent()) {
            Optional<Client> optClient = clientRepository.findById(client_id);
            Coach coach = optCoach.get();

            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            String username = jwtUtils.extractUsername(token);
            String role = jwtUtils.extractRole(token);

            if (!Objects.equals(username, coach.getUsername()) && !Objects.equals(role, "ADMIN")) {
                return "You can't assign to different coach";
            }

            if (optClient.isPresent()) {
                Client client = optClient.get();
                if (client.getCoach() == null) {
                    client.setCoach(coach);
                    client.setAssignedToCoach(true);
                    clientRepository.save(client);
                    return "success";
                } else {
                    return "Client already assigned";
                }
            } else {
                return "Client not found";
            }
        }
        return "Coach not found";
    }

    public String unsubscribeClientFromCoach(long client_id, String token) {
        Optional<Client> opt = clientRepository.findById(client_id);
        if (opt.isPresent()) {
            Client client = opt.get();
            if (client.getCoach() != null) {

                if (token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }
                String username = jwtUtils.extractUsername(token);
                String role = jwtUtils.extractRole(token);
                if (
                        !Objects.equals(username, client.getUsername()) &&
                        !Objects.equals(username, client.getCoach().getUsername()) &&
                        !Objects.equals(role, "ADMIN")) {
                    return "This is not your subscription";
                }

                client.setCoach(null);
                client.setAssignedToCoach(false);
                clientRepository.save(client);
                return "success";
            } else {
                return "Client is not assigned";
            }
        }
        return "Client not found";
    }
}
