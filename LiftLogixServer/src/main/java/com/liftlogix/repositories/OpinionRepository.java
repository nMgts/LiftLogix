package com.liftlogix.repositories;

import com.liftlogix.models.Opinion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpinionRepository extends JpaRepository<Opinion, Long> {
    boolean existsByClientIdAndCoachId(Long clientId, Long coachId);
    List<Opinion> findByCoachId(Long coachId);
    @Query("SELECT AVG(o.rating) FROM Opinion o WHERE o.coach.id = :coachId")
    Double findAverageRatingByCoachId(@Param("coachId") Long coachId);
}
