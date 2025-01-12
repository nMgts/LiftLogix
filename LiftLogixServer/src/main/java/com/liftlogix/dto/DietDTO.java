package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DietDTO {
    private Long id;
    private int calories;
    private int carbs;
    private int fats;
    private int proteins;
    private String notes;
    private long client_id;
}
