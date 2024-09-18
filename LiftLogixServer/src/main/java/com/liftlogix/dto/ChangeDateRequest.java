package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChangeDateRequest {
    private Long id;
    private LocalDateTime oldDate;
    private LocalDateTime newDate;
}
