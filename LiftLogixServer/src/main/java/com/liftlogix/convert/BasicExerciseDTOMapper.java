package com.liftlogix.convert;

import com.liftlogix.dto.BasicExerciseDTO;
import com.liftlogix.models.exercises.Exercise;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring", uses = {ExerciseAliasDTOMapper.class})
public interface BasicExerciseDTOMapper {

    @Mappings({
            @Mapping(source = "body_parts", target = "body_parts"),
            @Mapping(source = "aliases", target = "aliases"),
            @Mapping(target = "exercise_type", source = "exercise_type")
    })
    BasicExerciseDTO mapExerciseToBasicDTO(Exercise exercise);

    @Mappings({
            @Mapping(source = "body_parts", target = "body_parts"),
            @Mapping(source = "aliases", target = "aliases"),
            @Mapping(target = "exercise_type", source = "exercise_type")
    })
    Exercise mapBasicDTOToExercise(BasicExerciseDTO basicExerciseDTO);
}
