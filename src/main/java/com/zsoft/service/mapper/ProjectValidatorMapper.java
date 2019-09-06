package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ProjectValidatorDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ProjectValidator and its DTO ProjectValidatorDTO.
 */
@Mapper(componentModel = "spring", uses = {ProjectMapper.class, UserMapper.class})
public interface ProjectValidatorMapper extends EntityMapper<ProjectValidatorDTO, ProjectValidator> {

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "user.id", target = "userId")
    ProjectValidatorDTO toDto(ProjectValidator projectValidator);

    @Mapping(source = "projectId", target = "project")
    @Mapping(source = "userId", target = "user")
    ProjectValidator toEntity(ProjectValidatorDTO projectValidatorDTO);

    default ProjectValidator fromId(Long id) {
        if (id == null) {
            return null;
        }
        ProjectValidator projectValidator = new ProjectValidator();
        projectValidator.setId(id);
        return projectValidator;
    }
}
