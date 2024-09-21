package com.liftlogix.repositories;

import com.liftlogix.models.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByClientId(long clientId);
    Optional<Result> findByClientIdAndDate(long clientId, LocalDate date);
}
