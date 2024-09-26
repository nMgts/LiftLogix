package com.liftlogix.models.scheduler;

import com.liftlogix.models.plans.WorkoutUnit;
import com.liftlogix.models.users.Client;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "scheduler_item")
@Getter
@Setter
public class SchedulerItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "workout_unit_id", nullable = false)
    private WorkoutUnit workoutUnit;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @ManyToOne
    @JoinColumn(name = "coach_scheduler_id", nullable = false)
    private CoachScheduler coachScheduler;
}
