package com.liftlogix.services;

import com.liftlogix.models.Coach;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CoachService {
    private final CoachRepository coachRepository;

    public Coach findCoachById(Long id) throws Exception {
        Optional<Coach> opt = coachRepository.findById(id);
        if (opt.isPresent()) {
            return opt.get();
        }
        throw new Exception("Coach not found with id: " + id);
    }

    public List<Coach> findAllCoaches() {
        return coachRepository.findAll();
    }
}
