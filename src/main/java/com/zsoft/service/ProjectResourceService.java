package com.zsoft.service;

import com.zsoft.domain.ProjectResource;
import com.zsoft.repository.ProjectResourceRepository;
import com.zsoft.service.dto.ProjectResourceDTO;
import com.zsoft.service.mapper.ProjectResourceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing ProjectResource.
 */
@Service
@Transactional
public class ProjectResourceService {

    private final Logger log = LoggerFactory.getLogger(ProjectResourceService.class);

    private final ProjectResourceRepository projectResourceRepository;

    private final ProjectResourceMapper projectResourceMapper;

    public ProjectResourceService(ProjectResourceRepository projectResourceRepository, ProjectResourceMapper projectResourceMapper) {
        this.projectResourceRepository = projectResourceRepository;
        this.projectResourceMapper = projectResourceMapper;
    }

    /**
     * Save a projectResource.
     *
     * @param projectResourceDTO the entity to save
     * @return the persisted entity
     */
    public ProjectResourceDTO save(ProjectResourceDTO projectResourceDTO) {
        log.debug("Request to save ProjectResource : {}", projectResourceDTO);
        ProjectResource projectResource = projectResourceMapper.toEntity(projectResourceDTO);
        projectResource = projectResourceRepository.save(projectResource);
        return projectResourceMapper.toDto(projectResource);
    }

    /**
     * Get all the projectResources.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ProjectResourceDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ProjectResources");
        return projectResourceRepository.findAll(pageable)
            .map(projectResourceMapper::toDto);
    }


    /**
     * Get one projectResource by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ProjectResourceDTO> findOne(Long id) {
        log.debug("Request to get ProjectResource : {}", id);
        return projectResourceRepository.findById(id)
            .map(projectResourceMapper::toDto);
    }

    /**
     * Delete the projectResource by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ProjectResource : {}", id);
        projectResourceRepository.deleteById(id);
    }
}
