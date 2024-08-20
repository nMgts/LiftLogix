package com.liftlogix.convert;

import com.liftlogix.dto.BasicExerciseDTO;
import com.liftlogix.models.Exercise;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring", uses = {ExerciseAliasDTOMapper.class})
public interface BasicExerciseDTOMapper {

    @Mappings({
            @Mapping(source = "body_parts", target = "body_parts"),
            @Mapping(source = "aliases", target = "aliases")
    })
    BasicExerciseDTO mapExerciseToBasicDTO(Exercise exercise);

    @Mappings({
            @Mapping(source = "body_parts", target = "body_parts"),
            @Mapping(source = "aliases", target = "aliases")
    })
    Exercise mapBasicDTOToExercise(BasicExerciseDTO basicExerciseDTO);
}
