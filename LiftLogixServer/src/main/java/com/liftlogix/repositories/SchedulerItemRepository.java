package com.liftlogix.repositories;

import com.liftlogix.models.scheduler.SchedulerItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchedulerItemRepository extends JpaRepository<SchedulerItem, Long> {
}
