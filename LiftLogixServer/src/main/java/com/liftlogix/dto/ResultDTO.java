package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ResultDTO {
    private long id;
    private long client_id;
    private Double benchpress;
    private Double deadlift;
    private Double squat;
    private LocalDate date;
}
