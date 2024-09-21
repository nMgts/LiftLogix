package com.liftlogix.convert;

import com.liftlogix.dto.SchedulerItemDTO;
import com.liftlogix.models.SchedulerItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WorkoutDTOMapper.class, ClientDTOMapper.class})
public interface SchedulerItemDTOMapper {

    @Mapping(source = "workout.id", target = "workoutId")
    @Mapping(source = "workout.name", target = "workoutName")
    @Mapping(source = "client", target = "client")
    SchedulerItemDTO mapEntityToDTO(SchedulerItem schedulerItem);

    @Mapping(source = "workoutId", target = "workout.id")
    @Mapping(source = "workoutName", target = "workout.name")
    @Mapping(source = "client", target = "client")
    SchedulerItem mapDTOToEntity(SchedulerItemDTO schedulerItemDTO);
}
