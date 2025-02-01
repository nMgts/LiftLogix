package com.liftlogix.services;

import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.CoachClientHistoryRepository;
import com.liftlogix.repositories.CoachRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CoachClientHistoryService {
    private final CoachClientHistoryRepository coachClientHistoryRepository;
    private final ClientRepository clientRepository;
    private final CoachRepository coachRepository;

    public boolean hasHistoryBetweenClientAndCoach(Long coachId, Authentication authentication) {
        String username = authentication.getName();
        Client client = clientRepository.findByEmail(username)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));
        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new EntityNotFoundException("Coach not found"));

        return coachClientHistoryRepository.existsByCoachAndClient(coach, client);
    }
}
