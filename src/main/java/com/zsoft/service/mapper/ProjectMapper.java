package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ProjectDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Project and its DTO ProjectDTO.
 */
@Mapper(componentModel = "spring", uses = {CompanyMapper.class, ClientMapper.class})
public interface ProjectMapper extends EntityMapper<ProjectDTO, Project> {

    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "client.id", target = "clientId")
    ProjectDTO toDto(Project project);

    @Mapping(source = "companyId", target = "company")
    @Mapping(source = "clientId", target = "client")
    Project toEntity(ProjectDTO projectDTO);

    default Project fromId(Long id) {
        if (id == null) {
            return null;
        }
        Project project = new Project();
        project.setId(id);
        return project;
    }
}
