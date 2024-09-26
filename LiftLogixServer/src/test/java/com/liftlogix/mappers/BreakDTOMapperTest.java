package com.liftlogix.mappers;

import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import com.liftlogix.convert.BreakDTOMapper;
import com.liftlogix.dto.BreakDTO;
import com.liftlogix.models.plans.Break;
import com.liftlogix.types.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class BreakDTOMapperTest {

    private final BreakDTOMapper mapper = Mappers.getMapper(BreakDTOMapper.class);

    @Test
    public void testMapDTOToEntity() {
        // Given
        BreakDTO dto = new BreakDTO();
        dto.setValue(5);
        dto.setUnit("min");

        // When
        Break entity = mapper.mapDTOToEntity(dto);

        // Then
        assertEquals(5, entity.getValue());
        assertEquals(TimeUnit.min, entity.getUnit());
    }

    @Test
    public void testMapEntityToDTO() {
        // Given
        Break entity = new Break();
        entity.setValue(10);
        entity.setUnit(TimeUnit.s);

        // When
        BreakDTO dto = mapper.mapEntityToDTO(entity);

        // Then
        assertEquals(10, dto.getValue());
        assertEquals("s", dto.getUnit());
    }
}
