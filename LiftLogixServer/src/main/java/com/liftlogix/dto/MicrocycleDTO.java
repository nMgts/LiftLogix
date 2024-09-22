package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MicrocycleDTO {
    private long id;
    private Integer length;
    private List<WorkoutDTO> workouts;
    private List<WorkoutUnitDTO> workoutUnits;
}
