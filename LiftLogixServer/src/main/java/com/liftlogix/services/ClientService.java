package com.liftlogix.services;

import com.liftlogix.models.Client;
import com.liftlogix.models.Coach;
import com.liftlogix.models.User;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.CoachRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class ClientService {
    private final ClientRepository clientRepository;
    private final CoachRepository coachRepository;
    private final PasswordEncoder passwordEncoder;

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

    /*
        public User registerUser(UserRegisterDTO userDTO) {
        User user = userRegisterMapper.mapDTOToEntity(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        long currentTime = System.currentTimeMillis();
        user.setCreated_at(new Date(currentTime));
        user.setUpdated_at(new Date(currentTime));
        return userRepository.save(user);
    }

    public List<String> checkUserEmail(String email) {
        return userRepository.checkUserEmail(email);
    }

    public String checkUserPasswordByEmail(String email) {
        return userRepository.checkUserPasswordByEmail(email);
    }

    public User getUserDetailsByEmail(String email) {
        User user = userRepository.getUserDetailsByEmail(email);
        user.setAssignedToCoach(user.getCoach() != null);
        return userRepository.getUserDetailsByEmail(email);
    }
     */
}
