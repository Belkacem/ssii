package com.zsoft.service;

import com.zsoft.domain.ActivityReport;
import com.zsoft.repository.ActivityReportRepository;
import com.zsoft.service.dto.ActivityReportDTO;
import com.zsoft.service.mapper.ActivityReportMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing ActivityReport.
 */
@Service
@Transactional
public class ActivityReportService {

    private final Logger log = LoggerFactory.getLogger(ActivityReportService.class);

    private final ActivityReportRepository activityReportRepository;

    private final ActivityReportMapper activityReportMapper;

    public ActivityReportService(ActivityReportRepository activityReportRepository, ActivityReportMapper activityReportMapper) {
        this.activityReportRepository = activityReportRepository;
        this.activityReportMapper = activityReportMapper;
    }

    /**
     * Save a activityReport.
     *
     * @param activityReportDTO the entity to save
     * @return the persisted entity
     */
    public ActivityReportDTO save(ActivityReportDTO activityReportDTO) {
        log.debug("Request to save ActivityReport : {}", activityReportDTO);
        ActivityReport activityReport = activityReportMapper.toEntity(activityReportDTO);
        activityReport = activityReportRepository.save(activityReport);
        return activityReportMapper.toDto(activityReport);
    }

    /**
     * Get all the activityReports.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ActivityReportDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ActivityReports");
        return activityReportRepository.findAll(pageable)
            .map(activityReportMapper::toDto);
    }


    /**
     * Get one activityReport by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ActivityReportDTO> findOne(Long id) {
        log.debug("Request to get ActivityReport : {}", id);
        return activityReportRepository.findById(id)
            .map(activityReportMapper::toDto);
    }

    /**
     * Delete the activityReport by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ActivityReport : {}", id);
        activityReportRepository.deleteById(id);
    }
}
