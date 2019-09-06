package com.zsoft.service;

import com.zsoft.domain.ActivityReportFile;
import com.zsoft.repository.ActivityReportFileRepository;
import com.zsoft.service.dto.ActivityReportFileDTO;
import com.zsoft.service.mapper.ActivityReportFileMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing ActivityReportFile.
 */
@Service
@Transactional
public class ActivityReportFileService {

    private final Logger log = LoggerFactory.getLogger(ActivityReportFileService.class);

    private final ActivityReportFileRepository activityReportFileRepository;

    private final ActivityReportFileMapper activityReportFileMapper;

    public ActivityReportFileService(ActivityReportFileRepository activityReportFileRepository, ActivityReportFileMapper activityReportFileMapper) {
        this.activityReportFileRepository = activityReportFileRepository;
        this.activityReportFileMapper = activityReportFileMapper;
    }

    /**
     * Save a activityReportFile.
     *
     * @param activityReportFileDTO the entity to save
     * @return the persisted entity
     */
    public ActivityReportFileDTO save(ActivityReportFileDTO activityReportFileDTO) {
        log.debug("Request to save ActivityReportFile : {}", activityReportFileDTO);
        ActivityReportFile activityReportFile = activityReportFileMapper.toEntity(activityReportFileDTO);
        activityReportFile = activityReportFileRepository.save(activityReportFile);
        return activityReportFileMapper.toDto(activityReportFile);
    }

    /**
     * Get all the activityReportFiles.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ActivityReportFileDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ActivityReportFiles");
        return activityReportFileRepository.findAll(pageable)
            .map(activityReportFileMapper::toDto);
    }


    /**
     * Get one activityReportFile by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ActivityReportFileDTO> findOne(Long id) {
        log.debug("Request to get ActivityReportFile : {}", id);
        return activityReportFileRepository.findById(id)
            .map(activityReportFileMapper::toDto);
    }

    /**
     * Delete the activityReportFile by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ActivityReportFile : {}", id);
        activityReportFileRepository.deleteById(id);
    }
}
