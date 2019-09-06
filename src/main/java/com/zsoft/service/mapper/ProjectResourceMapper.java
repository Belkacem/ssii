package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ProjectResourceDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ProjectResource and its DTO ProjectResourceDTO.
 */
@Mapper(componentModel = "spring", uses = {ProjectMapper.class, ResourceMapper.class})
public interface ProjectResourceMapper extends EntityMapper<ProjectResourceDTO, ProjectResource> {

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "resource.id", target = "resourceId")
    ProjectResourceDTO toDto(ProjectResource projectResource);

    @Mapping(source = "projectId", target = "project")
    @Mapping(source = "resourceId", target = "resource")
    ProjectResource toEntity(ProjectResourceDTO projectResourceDTO);

    default ProjectResource fromId(Long id) {
        if (id == null) {
            return null;
        }
        ProjectResource projectResource = new ProjectResource();
        projectResource.setId(id);
        return projectResource;
    }
}
