package com.liftlogix.models.users;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "coach_client_history",
        uniqueConstraints = @UniqueConstraint(columnNames = {"coach_id", "client_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CoachClientHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id", nullable = false)
    private Coach coach;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;
}
