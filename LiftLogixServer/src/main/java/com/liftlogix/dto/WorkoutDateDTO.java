package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class WorkoutDateDTO {
    private LocalDateTime date;
    private boolean isIndividual;
}
