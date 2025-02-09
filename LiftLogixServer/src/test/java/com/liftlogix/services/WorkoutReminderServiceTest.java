package com.liftlogix.services;

import com.liftlogix.models.scheduler.CoachScheduler;
import com.liftlogix.models.scheduler.SchedulerItem;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.repositories.CoachScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutReminderServiceTest {

    @Mock
    private CoachRepository coachRepository;

    @Mock
    private CoachScheduleRepository coachScheduleRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private WorkoutReminderService workoutReminderService;

    private Coach coach;
    private SchedulerItem schedulerItem;
    private CoachScheduler coachScheduler;

    @BeforeEach
    void setUp() {
        coach = new Coach();
        coach.setEmail("coach@example.com");
        coach.setFirst_name("Jan");

        Client client = new Client();
        client.setFirst_name("Adam");
        client.setLast_name("Nowak");

        schedulerItem = new SchedulerItem();
        schedulerItem.setClient(client);
        schedulerItem.setStartDate(LocalDateTime.now().plusHours(1));

        coachScheduler = new CoachScheduler();
        coachScheduler.setSchedulerItems(List.of(schedulerItem));
    }

    @Test
    void shouldNotSendEmailWhenNoCoachSchedulerExists() {
        when(coachRepository.findAll()).thenReturn(List.of(coach));
        when(coachScheduleRepository.findByCoach(coach)).thenReturn(Optional.empty());

        workoutReminderService.checkUpcomingTrainings();

        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }
}
