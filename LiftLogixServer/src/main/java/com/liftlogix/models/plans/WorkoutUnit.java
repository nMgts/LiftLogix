package com.liftlogix.models.plans;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "workout_unit")
@Getter
@Setter
public class WorkoutUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "workout_unit_id")
    private List<WorkoutExercise> workoutExercises;

    private LocalDateTime date;
    private boolean isIndividual;
    private int duration;
    private int microcycleDay;
}
