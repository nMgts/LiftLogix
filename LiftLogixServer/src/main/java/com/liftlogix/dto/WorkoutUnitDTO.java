package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class WorkoutUnitDTO {
    private long id;
    private String name;
    private List<WorkoutExerciseDTO> workoutExercises;
    private LocalDateTime date;
    private boolean isIndividual;
    private int duration;
    private int microcycleDay;
}
