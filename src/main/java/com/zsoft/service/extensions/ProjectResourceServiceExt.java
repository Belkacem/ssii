package com.zsoft.service.extensions;

import com.zsoft.domain.ProjectResource;
import com.zsoft.repository.extensions.ProjectResourceRepositoryExt;
import com.zsoft.service.dto.ProjectResourceDTO;
import com.zsoft.service.mapper.ProjectResourceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service Implementation for managing ProjectResource.
 */
@Service
@Transactional
public class ProjectResourceServiceExt {

    private final Logger log = LoggerFactory.getLogger(ProjectResourceServiceExt.class);

    private final ProjectResourceRepositoryExt projectResourceRepositoryExt;

    private final ProjectResourceMapper projectResourceMapper;

    public ProjectResourceServiceExt(ProjectResourceRepositoryExt projectResourceRepositoryExt, ProjectResourceMapper projectResourceMapper) {
        this.projectResourceRepositoryExt = projectResourceRepositoryExt;
        this.projectResourceMapper = projectResourceMapper;
    }

    /**
     * Save a projectResource.
     *
     * @param projectResourceDTO the entity to save
     * @return the persisted entity
     */
    public ProjectResourceDTO create(ProjectResourceDTO projectResourceDTO) {
        log.debug("Request to save ProjectResource : {}", projectResourceDTO);

        ProjectResource projectResource = projectResourceMapper.toEntity(projectResourceDTO);
        projectResource = projectResourceRepositoryExt.save(projectResource);
        return projectResourceMapper.toDto(projectResource);
    }

    /**
     * Get all the projectResources.
     *
     * @param pageable   the pagination information
     * @param projectIds the list of project ids
     * @param ids        the list of project resource ids
     * @param resourceId the id of resource
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ProjectResourceDTO> findAll(Pageable pageable, List<Long> projectIds, List<Long> ids, Long resourceId) {
        log.debug("Request to get all ProjectResources by projectIds: {}, Ids: {}, resourceId: {}", projectIds, ids, resourceId);
        if (projectIds != null) {
            return projectResourceRepositoryExt.findAllByProject_IdIn(projectIds, pageable)
                .map(projectResourceMapper::toDto);
        } else if (ids != null) {
            return projectResourceRepositoryExt.findAllByIdIn(ids, pageable)
                .map(projectResourceMapper::toDto);
        } else if (resourceId != null) {
            return projectResourceRepositoryExt.findAllByResource_Id(resourceId, pageable)
                .map(projectResourceMapper::toDto);
        }
        return projectResourceRepositoryExt.findAll(pageable)
            .map(projectResourceMapper::toDto);
    }
}
