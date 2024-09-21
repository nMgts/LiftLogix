package com.liftlogix.models;

import com.liftlogix.types.BodyPart;
import com.liftlogix.types.ExerciseType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "exercises")
@Getter
@Setter
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String url;

    @Lob
    private byte[] image;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExerciseType exercise_type;

    @Column(nullable = false)
    private double difficulty_factor;

    @Column(nullable = false)
    private boolean isCertificated;

    @ElementCollection(targetClass = BodyPart.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "exercise_body_parts", joinColumns = @JoinColumn(name = "exercise_id"))
    private Set<BodyPart> body_parts;

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ExerciseAlias> aliases;

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WorkoutExercise> workoutExercises;
}
