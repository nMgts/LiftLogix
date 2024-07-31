package com.liftlogix.models;

import com.liftlogix.types.BodyPart;
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

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(nullable = false)
    @Lob
    private byte[] image;

    @ElementCollection(targetClass = BodyPart.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "exercise_body_parts", joinColumns = @JoinColumn(name = "exercise_id"))
    private Set<BodyPart> body_parts;
}
