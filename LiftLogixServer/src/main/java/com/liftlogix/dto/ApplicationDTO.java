package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ApplicationDTO {
    private long id;
    private ClientDTO client;
    private CoachDTO coach;
    private String description;
    private String status;
    private LocalDateTime submitted_date;
}
