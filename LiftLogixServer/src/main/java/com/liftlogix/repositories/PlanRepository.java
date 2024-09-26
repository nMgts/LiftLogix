package com.liftlogix.repositories;

import com.liftlogix.models.plans.Plan;
import com.liftlogix.models.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {

    List<Plan> findByAuthor(User author);
    List<Plan> findByIsPublicTrue();
}
