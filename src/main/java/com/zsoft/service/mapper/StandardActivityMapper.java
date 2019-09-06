package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.StandardActivityDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity StandardActivity and its DTO StandardActivityDTO.
 */
@Mapper(componentModel = "spring", uses = {ActivityReportMapper.class, ProjectValidatorMapper.class})
public interface StandardActivityMapper extends EntityMapper<StandardActivityDTO, StandardActivity> {

    @Mapping(source = "activityReport.id", target = "activityReportId")
    @Mapping(source = "validator.id", target = "validatorId")
    StandardActivityDTO toDto(StandardActivity standardActivity);

    @Mapping(source = "activityReportId", target = "activityReport")
    @Mapping(source = "validatorId", target = "validator")
    StandardActivity toEntity(StandardActivityDTO standardActivityDTO);

    default StandardActivity fromId(Long id) {
        if (id == null) {
            return null;
        }
        StandardActivity standardActivity = new StandardActivity();
        standardActivity.setId(id);
        return standardActivity;
    }
}
