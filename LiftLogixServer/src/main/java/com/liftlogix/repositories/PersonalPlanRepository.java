package com.liftlogix.repositories;

import com.liftlogix.models.PersonalPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalPlanRepository extends JpaRepository<PersonalPlan, Long> {
    Optional<PersonalPlan> findByClientIdAndIsActiveTrue(Long clientId);
    List<PersonalPlan> findByClientId(Long clientId);
    @Query("SELECT p FROM PersonalPlan p JOIN p.mesocycles m JOIN m.microcycles mic JOIN mic.workouts w WHERE w.id = :workoutId")
    Optional<PersonalPlan> findByWorkoutId(@Param("workoutId") Long workoutId);
}
