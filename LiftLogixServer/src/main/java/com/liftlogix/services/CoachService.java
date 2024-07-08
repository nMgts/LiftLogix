package com.liftlogix.services;

import com.liftlogix.convert.CoachDTOMapper;
import com.liftlogix.dto.CoachDTO;
import com.liftlogix.models.Coach;
import com.liftlogix.repositories.CoachRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CoachService {
    private final CoachRepository coachRepository;
    private final CoachDTOMapper coachDTOMapper;

    public CoachDTO findCoachById(Long id) {
        Optional<Coach> opt = coachRepository.findById(id);
        if (opt.isPresent()) {
            Coach coach = opt.get();
            return coachDTOMapper.mapEntityToDTO(coach);
        }
        throw new EntityNotFoundException("Coach not found with id: " + id);
    }

    public List<CoachDTO> findAllCoaches() {
        List<Coach> coaches = coachRepository.findAll();
        return coaches.stream()
                .map(coachDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }
}
