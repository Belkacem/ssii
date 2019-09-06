package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ProjectResourceInfoDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ProjectResourceInfo and its DTO ProjectResourceInfoDTO.
 */
@Mapper(componentModel = "spring", uses = {ProjectResourceMapper.class})
public interface ProjectResourceInfoMapper extends EntityMapper<ProjectResourceInfoDTO, ProjectResourceInfo> {

    @Mapping(source = "projectResource.id", target = "projectResourceId")
    ProjectResourceInfoDTO toDto(ProjectResourceInfo projectResourceInfo);

    @Mapping(source = "projectResourceId", target = "projectResource")
    ProjectResourceInfo toEntity(ProjectResourceInfoDTO projectResourceInfoDTO);

    default ProjectResourceInfo fromId(Long id) {
        if (id == null) {
            return null;
        }
        ProjectResourceInfo projectResourceInfo = new ProjectResourceInfo();
        projectResourceInfo.setId(id);
        return projectResourceInfo;
    }
}
