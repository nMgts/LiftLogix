package com.liftlogix.models;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Embeddable
@Getter
@Setter
public class WorkoutDate {
    private LocalDateTime date;
    private boolean isIndividual;
    private int duration;
}
