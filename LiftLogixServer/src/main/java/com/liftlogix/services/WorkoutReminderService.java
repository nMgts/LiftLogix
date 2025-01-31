package com.liftlogix.services;

import com.liftlogix.models.scheduler.CoachScheduler;
import com.liftlogix.models.scheduler.SchedulerItem;
import com.liftlogix.models.users.Coach;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.repositories.CoachScheduleRepository;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class WorkoutReminderService {
    private final CoachRepository coachRepository;
    private final CoachScheduleRepository coachScheduleRepository;
    private final EmailService emailService;

    @Scheduled(fixedRate = 60000)
    public void checkUpcomingTrainings() {
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
        LocalDateTime oneHourLater = now.plusHours(1);

        List<Coach> coaches = coachRepository.findAll();

        for (Coach coach : coaches) {
            Optional<CoachScheduler> scheduler = coachScheduleRepository.findByCoach(coach);
            if (scheduler.isPresent()) {
                for (SchedulerItem item : scheduler.get().getSchedulerItems()) {
                    if (item.getStartDate().isAfter(now) && item.getStartDate().equals(oneHourLater)) {
                        String subject = "Przypomnienie o treningu!";
                        String message = "Cześć " + coach.getFirst_name() + ",\n\nMasz trening za godzinę z: "
                                + item.getClient().getFirst_name() + " " + item.getClient().getLast_name() + "!";

                        emailService.sendEmail(coach.getEmail(), subject, message);
                    }
                }
            }
        }
    }
}
