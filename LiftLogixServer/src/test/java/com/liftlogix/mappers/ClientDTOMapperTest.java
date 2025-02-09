package com.liftlogix.mappers;

import com.liftlogix.convert.ClientDTOMapper;
import com.liftlogix.dto.ClientDTO;
import com.liftlogix.models.users.Client;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

public class ClientDTOMapperTest {

    private final ClientDTOMapper clientDTOMapper = Mappers.getMapper(ClientDTOMapper.class);

    @Test
    void mapEntityToDTO_ShouldMapCorrectly() {
        Client client = new Client();
        client.setId(1L);
        client.setEmail("client@example.com");

        ClientDTO clientDTO = clientDTOMapper.mapEntityToDTO(client);

        assertNotNull(clientDTO);
        assertEquals(1L, clientDTO.getId());
        assertEquals("client@example.com", clientDTO.getEmail());
    }

    @Test
    void mapDTOToEntity_ShouldMapCorrectly() {
        ClientDTO clientDTO = new ClientDTO();
        clientDTO.setId(2L);
        clientDTO.setEmail("test@example.com");

        Client client = clientDTOMapper.mapDTOToEntity(clientDTO);

        assertNotNull(client);
        assertEquals(2L, client.getId());
        assertEquals("test@example.com", client.getEmail());
    }

    @Test
    void mapByteArrayToBase64_ShouldReturnCorrectString() {
        byte[] imageBytes = "test-image".getBytes();
        String encoded = clientDTOMapper.map(imageBytes);

        assertNotNull(encoded);
        assertTrue(encoded.startsWith("data:image/png;base64,"));

        String base64String = encoded.substring("data:image/png;base64,".length());
        assertArrayEquals(imageBytes, Base64.getDecoder().decode(base64String));
    }

    @Test
    void mapBase64ToByteArray_ShouldReturnCorrectBytes() {
        String base64Encoded = "data:image/png;base64," + Base64.getEncoder().encodeToString("test-image".getBytes());
        byte[] decodedBytes = clientDTOMapper.map(base64Encoded);

        assertNotNull(decodedBytes);
        assertArrayEquals("test-image".getBytes(), decodedBytes);
    }

    @Test
    void mapByteArrayToBase64_NullInput_ShouldReturnNull() {
        assertNull(clientDTOMapper.map((byte[]) null));
    }

    @Test
    void mapBase64ToByteArray_NullInput_ShouldReturnNull() {
        assertNull(clientDTOMapper.map((String) null));
    }

    @Test
    void mapBase64ToByteArray_InvalidFormat_ShouldReturnNull() {
        assertNull(clientDTOMapper.map("invalid-base64-string"));
    }
}
