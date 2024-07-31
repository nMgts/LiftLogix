package com.liftlogix.convert;

import com.liftlogix.dto.ExerciseDTO;
import com.liftlogix.models.Exercise;
import org.mapstruct.*;

import java.util.Base64;

@Mapper(componentModel = "spring")
public interface ExerciseDTOMapper {

    @Mappings({
            @Mapping(target = "body_parts", source = "body_parts"),
            @Mapping(target = "image", source = "image")
    })
    ExerciseDTO mapExerciseToDTO(Exercise exercise);

    @Mapping(target = "body_parts", source = "body_parts")
    @Mapping(target = "image", ignore = true)
    Exercise mapDTOToExercise(ExerciseDTO dto);

    default String map(byte[] image) {
        if (image != null) {
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(image);
        }
        return null;
    }

    default byte[] map(String image) {
        if (image != null && image.startsWith("data:image/png;base64,")) {
            String base64Image = image.substring("data:image/png;base64,".length());
            return Base64.getDecoder().decode(base64Image);
        }
        return null;
    }
}
