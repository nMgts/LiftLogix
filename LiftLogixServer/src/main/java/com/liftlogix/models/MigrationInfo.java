package com.liftlogix.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "migration_info")
@Getter
@Setter
public class MigrationInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "migration_name", unique = true, nullable = false)
    private String migrationName;

    @Column(name = "executed_at", nullable = false)
    private Date executedAt;
}
