package com.liftlogix.models;

import com.liftlogix.types.TimeUnit;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
public class Break {

    private Integer value;

    @Enumerated(EnumType.STRING)
    private TimeUnit unit;
}
