package com.liftlogix.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "mesocycles")
@Getter
@Setter
public class Mesocycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "mesocycle_id")
    private List<Microcycle> microcycles;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "personal_plan_id")
    private PersonalPlan personalPlan;
}
