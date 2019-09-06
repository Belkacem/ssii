package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ProjectContractorDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ProjectContractor and its DTO ProjectContractorDTO.
 */
@Mapper(componentModel = "spring", uses = {ProjectMapper.class, UserMapper.class})
public interface ProjectContractorMapper extends EntityMapper<ProjectContractorDTO, ProjectContractor> {

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "user.id", target = "userId")
    ProjectContractorDTO toDto(ProjectContractor projectContractor);

    @Mapping(source = "projectId", target = "project")
    @Mapping(source = "userId", target = "user")
    ProjectContractor toEntity(ProjectContractorDTO projectContractorDTO);

    default ProjectContractor fromId(Long id) {
        if (id == null) {
            return null;
        }
        ProjectContractor projectContractor = new ProjectContractor();
        projectContractor.setId(id);
        return projectContractor;
    }
}
