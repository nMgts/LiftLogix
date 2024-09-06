package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class WorkoutDTO {
    private long id;
    private String name;
    private List<WorkoutExerciseDTO> workoutExercises;
    private List<Integer> days;
    private boolean isIndividual;
    private List<LocalDateTime> dates;
}
