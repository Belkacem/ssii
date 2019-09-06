package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ActivityReportFileDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ActivityReportFile and its DTO ActivityReportFileDTO.
 */
@Mapper(componentModel = "spring", uses = {ActivityReportMapper.class})
public interface ActivityReportFileMapper extends EntityMapper<ActivityReportFileDTO, ActivityReportFile> {

    @Mapping(source = "activityReport.id", target = "activityReportId")
    ActivityReportFileDTO toDto(ActivityReportFile activityReportFile);

    @Mapping(source = "activityReportId", target = "activityReport")
    ActivityReportFile toEntity(ActivityReportFileDTO activityReportFileDTO);

    default ActivityReportFile fromId(Long id) {
        if (id == null) {
            return null;
        }
        ActivityReportFile activityReportFile = new ActivityReportFile();
        activityReportFile.setId(id);
        return activityReportFile;
    }
}
