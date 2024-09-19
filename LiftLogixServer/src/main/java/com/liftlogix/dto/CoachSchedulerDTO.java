package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CoachSchedulerDTO {
    private long id;
    private CoachDTO coach;
    private List<SchedulerItemDTO> schedulerItems;
}
