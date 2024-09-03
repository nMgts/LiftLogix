package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkoutExerciseDTO {
    private long id;
    private long exerciseId;
    private String exerciseName;
    private Integer series;
    private Integer repetitionsFrom;
    private Integer repetitionsTo;
    private Double weight;
    private Double percentage;
    private String tempo;
    private Double rpe;
    private BreakDTO breakTime;
}
