package com.liftlogix.models.plans;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "workouts")
@Getter
@Setter
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "workout_id")
    private List<WorkoutExercise> workoutExercises;

    @ElementCollection
    @CollectionTable(name = "workout_days", joinColumns = @JoinColumn(name = "workout_id"))
    @Column(name = "day")
    private List<Integer> days;
}
