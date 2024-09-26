package com.liftlogix.models.scheduler;

import com.liftlogix.models.users.Coach;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "coach_scheduler")
@Getter
@Setter
public class CoachScheduler {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "coach_id", nullable = false)
    private Coach coach;

    @OneToMany(mappedBy = "coachScheduler", cascade = CascadeType.ALL)
    private List<SchedulerItem> schedulerItems;
}
