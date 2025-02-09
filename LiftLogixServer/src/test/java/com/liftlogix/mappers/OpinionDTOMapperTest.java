package com.liftlogix.mappers;

import com.liftlogix.convert.OpinionDTOMapper;
import com.liftlogix.dto.OpinionDTO;
import com.liftlogix.models.Opinion;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.junit.jupiter.api.Assertions.*;

public class OpinionDTOMapperTest {

    private final OpinionDTOMapper opinionDTOMapper = Mappers.getMapper(OpinionDTOMapper.class);

    @Test
    void mapEntityToDTO_ShouldMapCorrectly() {
        Coach coach = new Coach();
        coach.setId(1L);

        Client client = new Client();
        client.setId(2L);

        Opinion opinion = new Opinion();
        opinion.setId(10L);
        opinion.setRating(5);
        opinion.setDescription("Great coach!");
        opinion.setCoach(coach);
        opinion.setClient(client);

        OpinionDTO opinionDTO = opinionDTOMapper.mapEntityToDTO(opinion);

        assertNotNull(opinionDTO);
        assertEquals(10L, opinionDTO.getId());
        assertEquals(5, opinionDTO.getRating());
        assertEquals("Great coach!", opinionDTO.getDescription());
        assertEquals(1L, opinionDTO.getCoachId());
        assertEquals(2L, opinionDTO.getClientId());
    }

    @Test
    void mapDTOToEntity_ShouldMapCorrectly() {
        OpinionDTO opinionDTO = new OpinionDTO();
        opinionDTO.setId(10L);
        opinionDTO.setRating(4);
        opinionDTO.setDescription("Good training plan.");
        opinionDTO.setCoachId(1L);
        opinionDTO.setClientId(2L);

        Opinion opinion = opinionDTOMapper.mapDTOToEntity(opinionDTO);

        assertNotNull(opinion);
        assertEquals(10L, opinion.getId());
        assertEquals(4, opinion.getRating());
        assertEquals("Good training plan.", opinion.getDescription());
        assertNull(opinion.getCoach()); // Coach is ignored
        assertNull(opinion.getClient()); // Client is ignored
    }
}
