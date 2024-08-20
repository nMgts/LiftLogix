package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class PersonalPlanDTO {
    private Long id;
    private String name;
    private List<MesocycleDTO> mesocycles;
    private ClientDTO client;
    private LocalDate startDate;
}
