package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SchedulerItemDTO {
    private long id;
    private long workoutId;
    private String workoutName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private ClientDTO client;
}
