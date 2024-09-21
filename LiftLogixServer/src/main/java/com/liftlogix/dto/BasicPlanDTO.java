package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BasicPlanDTO {
    private long id;
    private String name;
    private String author;
    private int length;
    private boolean isPublic;
}
