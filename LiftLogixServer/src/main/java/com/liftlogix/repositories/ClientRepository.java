package com.liftlogix.repositories;

import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByEmail(String email);
    List<Client> findByCoach(Coach coach);
}
