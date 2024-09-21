package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MesocycleDTO {
    private long id;
    private List<MicrocycleDTO> microcycles;
}
