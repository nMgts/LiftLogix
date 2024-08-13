package com.liftlogix.convert;


import com.liftlogix.dto.ResultDTO;
import com.liftlogix.models.Result;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Mapper(componentModel = "spring")
public interface ResultDTOMapper {

    @Mapping(source = "client.id", target = "client_id")
    ResultDTO mapEntityToDTO(Result result);

    @Mapping(target = "client", ignore = true)
    Result mapDTOToEntity(ResultDTO dto);
}
