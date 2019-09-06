package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ActivityReportDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ActivityReport and its DTO ActivityReportDTO.
 */
@Mapper(componentModel = "spring", uses = {ProjectResourceMapper.class})
public interface ActivityReportMapper extends EntityMapper<ActivityReportDTO, ActivityReport> {

    @Mapping(source = "projectResource.id", target = "projectResourceId")
    ActivityReportDTO toDto(ActivityReport activityReport);

    @Mapping(source = "projectResourceId", target = "projectResource")
    @Mapping(target = "standardActivities", ignore = true)
    @Mapping(target = "exceptionalActivities", ignore = true)
    ActivityReport toEntity(ActivityReportDTO activityReportDTO);

    default ActivityReport fromId(Long id) {
        if (id == null) {
            return null;
        }
        ActivityReport activityReport = new ActivityReport();
        activityReport.setId(id);
        return activityReport;
    }
}
