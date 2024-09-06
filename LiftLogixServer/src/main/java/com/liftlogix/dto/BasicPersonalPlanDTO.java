package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BasicPersonalPlanDTO {
    private long id;
    private String name;
    private int length;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isActive;
}
