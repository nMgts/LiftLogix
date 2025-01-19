package com.liftlogix.convert;

import com.liftlogix.dto.NoteDTO;
import com.liftlogix.models.Note;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NoteDTOMapper {

    @Mapping(source = "coach.id", target = "coach_id")
    NoteDTO mapEntityToDTO(Note note);

    @Mapping(target = "coach", ignore = true)
    Note mapDTOToEntity(NoteDTO dto);
}
