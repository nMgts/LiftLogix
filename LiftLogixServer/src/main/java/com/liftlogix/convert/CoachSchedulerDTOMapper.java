package com.liftlogix.convert;

import com.liftlogix.dto.CoachSchedulerDTO;
import com.liftlogix.models.CoachScheduler;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CoachDTOMapper.class, SchedulerItemDTOMapper.class})
public interface CoachSchedulerDTOMapper {

    @Mapping(source = "coach", target = "coach")
    @Mapping(source = "schedulerItems", target = "schedulerItems")
    CoachSchedulerDTO mapEntityToDTO(CoachScheduler coachScheduler);

    @Mapping(source = "coach", target = "coach")
    @Mapping(source = "schedulerItems", target = "schedulerItems")
    CoachScheduler mapDTOToEntity(CoachSchedulerDTO coachSchedulerDTO);
}
