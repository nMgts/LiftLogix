package com.liftlogix.repositories;

import com.liftlogix.models.PersonalPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonalPlanRepository extends JpaRepository<PersonalPlan, Long> {
    Optional<PersonalPlan> findByClientIdAndIsActiveTrue(Long clientId);
}
