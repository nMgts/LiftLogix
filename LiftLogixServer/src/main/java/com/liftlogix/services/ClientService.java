package com.liftlogix.services;

import com.liftlogix.models.Client;
import com.liftlogix.models.Coach;
import com.liftlogix.models.User;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.repositories.UserRepository;
import com.liftlogix.util.JWTUtils;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ClientService {
    private final ClientRepository clientRepository;
    private final CoachRepository coachRepository;
    private final UserRepository userRepository;
    private final JWTUtils jwtUtils;

    public List<Client> findAllClients() {
        return clientRepository.findAll();
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

            if (!Objects.equals(username, coach.getUsername()) && Objects.equals(role, "ADMIN")) {
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
                if (!Objects.equals(username, client.getUsername()) && !Objects.equals(username, client.getCoach().getUsername())) {
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
