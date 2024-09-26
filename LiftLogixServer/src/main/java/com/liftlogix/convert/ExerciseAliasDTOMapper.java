package com.liftlogix.convert;

import com.liftlogix.dto.ExerciseAliasDTO;
import com.liftlogix.models.exercises.ExerciseAlias;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ExerciseAliasDTOMapper {

    ExerciseAliasDTO mapEntityToDTO(ExerciseAlias alias);
    ExerciseAlias mapDTOToEntity(ExerciseAliasDTO dto);
}
