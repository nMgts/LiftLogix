package com.liftlogix.convert;

import com.liftlogix.dto.ReportDTO;
import com.liftlogix.models.Report;
import com.liftlogix.repositories.PersonalPlanRepository;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class ReportDTOMapper {

    @Autowired
    PersonalPlanRepository personalPlanRepository;

    @Mapping(source = "workoutUnit.id", target = "workoutUnitId")
    @Mapping(source = "workoutUnit.name", target = "workoutUnitName")
    @Mapping(source = "workoutUnit.date", target = "workoutUnitDate")
    public abstract ReportDTO mapEntityToDTO(Report report);

    @Mapping(source = "workoutUnitId", target = "workoutUnit.id")
    public abstract Report mapDTOToEntity(ReportDTO dto);

    @AfterMapping
    protected void addClientDetails(@MappingTarget ReportDTO dto, Report report) {
        personalPlanRepository.findClientByWorkoutUnitId(report.getWorkoutUnit().getId())
                .ifPresent(client -> {
                    dto.setClientFirstName(client.getFirst_name());
                    dto.setClientLastName(client.getLast_name());
                    dto.setClientEmail(client.getEmail());
                });
    }
}
