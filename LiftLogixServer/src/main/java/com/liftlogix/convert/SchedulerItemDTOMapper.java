package com.liftlogix.convert;

import com.liftlogix.dto.SchedulerItemDTO;
import com.liftlogix.models.scheduler.SchedulerItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WorkoutUnitDTOMapper.class, ClientDTOMapper.class})
public interface SchedulerItemDTOMapper {

    @Mapping(source = "workoutUnit.id", target = "workoutUnitId")
    @Mapping(source = "workoutUnit.name", target = "workoutUnitName")
    @Mapping(source = "client", target = "client")
    SchedulerItemDTO mapEntityToDTO(SchedulerItem schedulerItem);

    @Mapping(source = "workoutUnitId", target = "workoutUnit.id")
    @Mapping(source = "workoutUnitName", target = "workoutUnit.name")
    @Mapping(source = "client", target = "client")
    SchedulerItem mapDTOToEntity(SchedulerItemDTO schedulerItemDTO);
}
