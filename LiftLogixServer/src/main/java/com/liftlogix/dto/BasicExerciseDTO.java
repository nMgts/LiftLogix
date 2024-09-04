package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
public class BasicExerciseDTO {
    private long id;
    private String name;
    private List<String> body_parts;
    private boolean isCertificated;
    private String exercise_type;
    private Set<ExerciseAliasDTO> aliases;
}
