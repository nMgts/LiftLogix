package com.liftlogix.services;

import com.liftlogix.models.Client;
import com.liftlogix.models.Coach;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.CoachRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ClientService {
    private final ClientRepository clientRepository;
    private final CoachRepository coachRepository;

    public List<Client> findAllClients() {
        return clientRepository.findAll();
    }

    public String assignClientToCoach(long client_id, long coach_id) {
        Optional<Coach> optCoach = coachRepository.findById(coach_id);
        if (optCoach.isPresent()) {
            Optional<Client> optClient = clientRepository.findById(client_id);
            if (optClient.isPresent()) {
                Coach coach = optCoach.get();
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

    public String unsubscribeClientFromCoach(long client_id) {
        Optional<Client> opt = clientRepository.findById(client_id);
        if (opt.isPresent()) {
            Client client = opt.get();
            if (client.getCoach() != null) {
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
