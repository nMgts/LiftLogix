package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ShiftWorkoutDatesRequest {
    private PersonalPlanDTO personalPlanDTO;
    private LocalDate startDate;
    private LocalDate endDate;
    private int shift;
}
