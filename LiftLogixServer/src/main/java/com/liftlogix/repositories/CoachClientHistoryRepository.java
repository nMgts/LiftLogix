package com.liftlogix.repositories;

import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.models.users.CoachClientHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoachClientHistoryRepository extends JpaRepository<CoachClientHistory, Long> {
    boolean existsByCoachAndClient(Coach coach, Client client);
}
