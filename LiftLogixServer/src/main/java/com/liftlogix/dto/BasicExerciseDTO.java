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
    private Set<ExerciseAliasDTO> aliases;
}
