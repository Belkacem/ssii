package com.zsoft.service;

import com.zsoft.domain.ProjectValidator;
import com.zsoft.repository.ProjectValidatorRepository;
import com.zsoft.service.dto.ProjectValidatorDTO;
import com.zsoft.service.mapper.ProjectValidatorMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing ProjectValidator.
 */
@Service
@Transactional
public class ProjectValidatorService {

    private final Logger log = LoggerFactory.getLogger(ProjectValidatorService.class);

    private final ProjectValidatorRepository projectValidatorRepository;

    private final ProjectValidatorMapper projectValidatorMapper;

    public ProjectValidatorService(ProjectValidatorRepository projectValidatorRepository, ProjectValidatorMapper projectValidatorMapper) {
        this.projectValidatorRepository = projectValidatorRepository;
        this.projectValidatorMapper = projectValidatorMapper;
    }

    /**
     * Save a projectValidator.
     *
     * @param projectValidatorDTO the entity to save
     * @return the persisted entity
     */
    public ProjectValidatorDTO save(ProjectValidatorDTO projectValidatorDTO) {
        log.debug("Request to save ProjectValidator : {}", projectValidatorDTO);
        ProjectValidator projectValidator = projectValidatorMapper.toEntity(projectValidatorDTO);
        projectValidator = projectValidatorRepository.save(projectValidator);
        return projectValidatorMapper.toDto(projectValidator);
    }

    /**
     * Get all the projectValidators.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ProjectValidatorDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ProjectValidators");
        return projectValidatorRepository.findAll(pageable)
            .map(projectValidatorMapper::toDto);
    }


    /**
     * Get one projectValidator by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ProjectValidatorDTO> findOne(Long id) {
        log.debug("Request to get ProjectValidator : {}", id);
        return projectValidatorRepository.findById(id)
            .map(projectValidatorMapper::toDto);
    }

    /**
     * Delete the projectValidator by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ProjectValidator : {}", id);
        projectValidatorRepository.deleteById(id);
    }
}
