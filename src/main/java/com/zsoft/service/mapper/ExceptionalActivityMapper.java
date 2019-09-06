package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ExceptionalActivityDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ExceptionalActivity and its DTO ExceptionalActivityDTO.
 */
@Mapper(componentModel = "spring", uses = {ActivityReportMapper.class, ProjectValidatorMapper.class})
public interface ExceptionalActivityMapper extends EntityMapper<ExceptionalActivityDTO, ExceptionalActivity> {

    @Mapping(source = "activityReport.id", target = "activityReportId")
    @Mapping(source = "validator.id", target = "validatorId")
    ExceptionalActivityDTO toDto(ExceptionalActivity exceptionalActivity);

    @Mapping(source = "activityReportId", target = "activityReport")
    @Mapping(source = "validatorId", target = "validator")
    ExceptionalActivity toEntity(ExceptionalActivityDTO exceptionalActivityDTO);

    default ExceptionalActivity fromId(Long id) {
        if (id == null) {
            return null;
        }
        ExceptionalActivity exceptionalActivity = new ExceptionalActivity();
        exceptionalActivity.setId(id);
        return exceptionalActivity;
    }
}
