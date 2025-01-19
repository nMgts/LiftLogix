package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NoteDTO {
    private Long id;
    private String text;
    private int position;
    private long coach_id;
}
