package com.liftlogix.repositories;

import com.liftlogix.models.users.Coach;
import com.liftlogix.models.scheduler.CoachScheduler;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoachScheduleRepository extends JpaRepository<CoachScheduler, Long> {
    Optional<CoachScheduler> findByCoach(Coach coach);
}
