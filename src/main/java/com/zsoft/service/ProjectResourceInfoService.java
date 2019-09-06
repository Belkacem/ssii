package com.zsoft.service;

import com.zsoft.domain.ProjectResourceInfo;
import com.zsoft.repository.ProjectResourceInfoRepository;
import com.zsoft.service.dto.ProjectResourceInfoDTO;
import com.zsoft.service.mapper.ProjectResourceInfoMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing ProjectResourceInfo.
 */
@Service
@Transactional
public class ProjectResourceInfoService {

    private final Logger log = LoggerFactory.getLogger(ProjectResourceInfoService.class);

    private final ProjectResourceInfoRepository projectResourceInfoRepository;

    private final ProjectResourceInfoMapper projectResourceInfoMapper;

    public ProjectResourceInfoService(ProjectResourceInfoRepository projectResourceInfoRepository, ProjectResourceInfoMapper projectResourceInfoMapper) {
        this.projectResourceInfoRepository = projectResourceInfoRepository;
        this.projectResourceInfoMapper = projectResourceInfoMapper;
    }

    /**
     * Save a projectResourceInfo.
     *
     * @param projectResourceInfoDTO the entity to save
     * @return the persisted entity
     */
    public ProjectResourceInfoDTO save(ProjectResourceInfoDTO projectResourceInfoDTO) {
        log.debug("Request to save ProjectResourceInfo : {}", projectResourceInfoDTO);
        ProjectResourceInfo projectResourceInfo = projectResourceInfoMapper.toEntity(projectResourceInfoDTO);
        projectResourceInfo = projectResourceInfoRepository.save(projectResourceInfo);
        return projectResourceInfoMapper.toDto(projectResourceInfo);
    }

    /**
     * Get all the projectResourceInfos.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ProjectResourceInfoDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ProjectResourceInfos");
        return projectResourceInfoRepository.findAll(pageable)
            .map(projectResourceInfoMapper::toDto);
    }


    /**
     * Get one projectResourceInfo by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ProjectResourceInfoDTO> findOne(Long id) {
        log.debug("Request to get ProjectResourceInfo : {}", id);
        return projectResourceInfoRepository.findById(id)
            .map(projectResourceInfoMapper::toDto);
    }

    /**
     * Delete the projectResourceInfo by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ProjectResourceInfo : {}", id);
        projectResourceInfoRepository.deleteById(id);
    }
}
