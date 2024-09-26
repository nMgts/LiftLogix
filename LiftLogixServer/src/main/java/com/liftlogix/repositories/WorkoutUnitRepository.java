package com.liftlogix.repositories;

import com.liftlogix.models.plans.WorkoutUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkoutUnitRepository extends JpaRepository<WorkoutUnit, Long> {
}
