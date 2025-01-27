package com.liftlogix.models;

import com.liftlogix.models.plans.WorkoutUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(columnDefinition = "TEXT")
    private String clientReport;
    private LocalDateTime clientReportDate;

    @Column(columnDefinition = "TEXT")
    private String coachReport;
    private LocalDateTime coachReportDate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_unit_id", referencedColumnName = "id", nullable = false, unique = true)
    private WorkoutUnit workoutUnit;
    private Boolean isWorkoutDone;
}
