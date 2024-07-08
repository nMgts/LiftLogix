package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationDTO {
    private long id;
    private ClientDTO client;
    private CoachDTO coach;
    private String description;
    private String status;
}
