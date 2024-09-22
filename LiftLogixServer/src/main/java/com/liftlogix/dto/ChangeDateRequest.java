package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChangeDateRequest {
    private Long id;
    private Integer duration;
    private LocalDateTime newDate;
}
