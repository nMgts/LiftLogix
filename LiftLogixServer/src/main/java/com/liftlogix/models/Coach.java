package com.liftlogix.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "coaches")
@Getter
@Setter
public class Coach extends User {
    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "coach")
    private List<Application> applications;
}
