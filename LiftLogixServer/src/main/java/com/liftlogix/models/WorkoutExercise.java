package com.liftlogix.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "workout_exercises")
@Getter
@Setter
public class WorkoutExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_id")
    private Workout workout;

    private Integer series;

    @Column(name = "repetitions_from")
    private Integer repetitionsFrom;

    @Column(name = "repetitions_to")
    private Integer repetitionsTo;
    private Double weight;
    private Double percentage;
    private String tempo;
    private Integer rpe;

    @Embedded
    private Break breakTime;
}
