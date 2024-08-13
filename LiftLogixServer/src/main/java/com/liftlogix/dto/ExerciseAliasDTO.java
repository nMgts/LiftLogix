package com.liftlogix.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonSerialize
@JsonDeserialize
public class ExerciseAliasDTO {
    private long id;;
    private String alias;
    private String language;
}
