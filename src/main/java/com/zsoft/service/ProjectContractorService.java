package com.zsoft.service;

import com.zsoft.domain.ProjectContractor;
import com.zsoft.repository.ProjectContractorRepository;
import com.zsoft.service.dto.ProjectContractorDTO;
import com.zsoft.service.mapper.ProjectContractorMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing ProjectContractor.
 */
@Service
@Transactional
public class ProjectContractorService {

    private final Logger log = LoggerFactory.getLogger(ProjectContractorService.class);

    private final ProjectContractorRepository projectContractorRepository;

    private final ProjectContractorMapper projectContractorMapper;

    public ProjectContractorService(ProjectContractorRepository projectContractorRepository, ProjectContractorMapper projectContractorMapper) {
        this.projectContractorRepository = projectContractorRepository;
        this.projectContractorMapper = projectContractorMapper;
    }

    /**
     * Save a projectContractor.
     *
     * @param projectContractorDTO the entity to save
     * @return the persisted entity
     */
    public ProjectContractorDTO save(ProjectContractorDTO projectContractorDTO) {
        log.debug("Request to save ProjectContractor : {}", projectContractorDTO);
        ProjectContractor projectContractor = projectContractorMapper.toEntity(projectContractorDTO);
        projectContractor = projectContractorRepository.save(projectContractor);
        return projectContractorMapper.toDto(projectContractor);
    }

    /**
     * Get all the projectContractors.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ProjectContractorDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ProjectContractors");
        return projectContractorRepository.findAll(pageable)
            .map(projectContractorMapper::toDto);
    }


    /**
     * Get one projectContractor by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ProjectContractorDTO> findOne(Long id) {
        log.debug("Request to get ProjectContractor : {}", id);
        return projectContractorRepository.findById(id)
            .map(projectContractorMapper::toDto);
    }

    /**
     * Delete the projectContractor by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ProjectContractor : {}", id);
        projectContractorRepository.deleteById(id);
    }
}
