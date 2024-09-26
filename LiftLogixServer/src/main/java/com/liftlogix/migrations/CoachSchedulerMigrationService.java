package com.liftlogix.migrations;

import com.liftlogix.models.users.Coach;
import com.liftlogix.models.scheduler.CoachScheduler;
import com.liftlogix.models.MigrationInfo;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.repositories.CoachScheduleRepository;
import com.liftlogix.repositories.MigrationInfoRepository;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@AllArgsConstructor
public class CoachSchedulerMigrationService {
    private final CoachRepository coachRepository;
    private final CoachScheduleRepository coachScheduleRepository;
    private final MigrationInfoRepository migrationInfoRepository;

    @PostConstruct
    public void addSchedulersToExistingCoaches() {
        if (!migrationInfoRepository.existsByMigrationName("AddSchedulersToExistingCoaches")) {
            List<Coach> coaches = coachRepository.findAll();
            for (Coach coach : coaches) {
                CoachScheduler coachScheduler = new CoachScheduler();
                coachScheduler.setCoach(coach);
                coachScheduleRepository.save(coachScheduler);
            }

            MigrationInfo migrationInfo = new MigrationInfo();
            migrationInfo.setMigrationName("AddSchedulersToExistingCoaches");
            migrationInfo.setExecutedAt(new Date());
            migrationInfoRepository.save(migrationInfo);
        }
    }
}
