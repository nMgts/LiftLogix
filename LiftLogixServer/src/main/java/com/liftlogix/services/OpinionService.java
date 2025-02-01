package com.liftlogix.services;

import com.liftlogix.convert.OpinionDTOMapper;
import com.liftlogix.dto.OpinionDTO;
import com.liftlogix.models.Opinion;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.repositories.OpinionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OpinionService {
    private final OpinionRepository opinionRepository;
    private final CoachClientHistoryService coachClientHistoryService;
    private final CoachRepository coachRepository;
    private final ClientRepository clientRepository;
    private final OpinionDTOMapper opinionDTOMapper;

    public OpinionDTO addOpinion(OpinionDTO opinionDTO, Authentication authentication) {
        Long clientId = opinionDTO.getClientId();
        Long coachId = opinionDTO.getCoachId();

        if (!coachClientHistoryService.hasHistoryBetweenClientAndCoach(coachId, authentication)) {
            throw new IllegalStateException("Client has no history with coach");
        }

        if (opinionDTO.getRating() < 1.0 || opinionDTO.getRating() > 5.0) {
            throw new IllegalArgumentException("Rating must be in the range of 1-5");
        }

        if (opinionRepository.existsByClientIdAndCoachId(clientId, coachId)) {
            throw new IllegalStateException("Client has already submitted an opinion for this coach");
        }

        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new EntityNotFoundException("Coach not found"));
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));

        Opinion opinion = opinionDTOMapper.mapDTOToEntity(opinionDTO);
        opinion.setCoach(coach);
        opinion.setClient(client);
        opinion.setCreatedAt(LocalDateTime.now());

        opinionRepository.save(opinion);
        return opinionDTO;
    }

    public double getAverageRating(Long coachId) {
        Double avgRating = opinionRepository.findAverageRatingByCoachId(coachId);
        return avgRating != null ? avgRating : 0.0;
    }

    public List<OpinionDTO> getOpinionsByCoach(Long coachId) {
        List<Opinion> opinions = opinionRepository.findByCoachId(coachId);
        return opinions.stream().map(opinionDTOMapper::mapEntityToDTO).collect(Collectors.toList());
    }
}
