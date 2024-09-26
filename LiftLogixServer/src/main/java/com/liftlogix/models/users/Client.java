package com.liftlogix.models.users;

import com.liftlogix.models.Application;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "clients")
@Getter
@Setter
public class Client extends User {
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "coach_id", referencedColumnName = "id")
    private Coach coach;

    @Transient
    private boolean assignedToCoach;

    @OneToMany(mappedBy = "client")
    private List<Application> applications;
}
