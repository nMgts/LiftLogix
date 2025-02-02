package com.liftlogix.repositories;

import com.liftlogix.models.Application;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<Application> findByClientAndCoach(Client client, Coach coach);
    List<Application> findByClient(Client client);
}
