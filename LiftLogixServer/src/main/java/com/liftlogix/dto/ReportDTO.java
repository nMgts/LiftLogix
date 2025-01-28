package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReportDTO {
    private long id;
    private String clientReport;
    private LocalDateTime clientReportDate;
    private String coachReport;
    private LocalDateTime coachReportDate;
    private long workoutUnitId;
    private String workoutUnitName;
    private LocalDateTime workoutUnitDate;
    private String clientFirstName;
    private String clientLastName;
    private String clientEmail;
    private Boolean isWorkoutDone;
}
