package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CoachDTO {
    private long id;
    private String first_name;
    private String last_name;
    private String email;
    private String description;
}
