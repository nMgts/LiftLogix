package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PlanDTO {
    private long id;
    private String name;
    private UserDTO author;
    private boolean isPublic;
    private List<MesocycleDTO> mesocycles;
}
