package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class WorkoutDTO {
    private long id;
    private String name;
    private List<WorkoutExerciseDTO> workoutExercises; // Używamy DTO dla encji WorkoutExercise
    private List<Integer> days;
}
