package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
public class ExerciseDTO {
    private long id;
    private String name;
    private String description;
    private String url;
    private String image;
    private List<String> body_parts;
    private String exercise_type;
    private double difficulty_factor;
    private boolean isCertificated;
    private Set<ExerciseAliasDTO> aliases;
}
