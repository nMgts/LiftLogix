package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class OpinionDTO {
    private Long id;
    private Long coachId;
    private Long clientId;
    private double rating;
    private String description;
    private LocalDateTime createdAt;
}
