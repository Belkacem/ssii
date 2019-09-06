package com.zsoft.service;

import com.zsoft.domain.ExceptionalActivity;
import com.zsoft.repository.ExceptionalActivityRepository;
import com.zsoft.service.dto.ExceptionalActivityDTO;
import com.zsoft.service.mapper.ExceptionalActivityMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing ExceptionalActivity.
 */
@Service
@Transactional
public class ExceptionalActivityService {

    private final Logger log = LoggerFactory.getLogger(ExceptionalActivityService.class);

    private final ExceptionalActivityRepository exceptionalActivityRepository;

    private final ExceptionalActivityMapper exceptionalActivityMapper;

    public ExceptionalActivityService(ExceptionalActivityRepository exceptionalActivityRepository, ExceptionalActivityMapper exceptionalActivityMapper) {
        this.exceptionalActivityRepository = exceptionalActivityRepository;
        this.exceptionalActivityMapper = exceptionalActivityMapper;
    }

    /**
     * Save a exceptionalActivity.
     *
     * @param exceptionalActivityDTO the entity to save
     * @return the persisted entity
     */
    public ExceptionalActivityDTO save(ExceptionalActivityDTO exceptionalActivityDTO) {
        log.debug("Request to save ExceptionalActivity : {}", exceptionalActivityDTO);
        ExceptionalActivity exceptionalActivity = exceptionalActivityMapper.toEntity(exceptionalActivityDTO);
        exceptionalActivity = exceptionalActivityRepository.save(exceptionalActivity);
        return exceptionalActivityMapper.toDto(exceptionalActivity);
    }

    /**
     * Get all the exceptionalActivities.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ExceptionalActivityDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ExceptionalActivities");
        return exceptionalActivityRepository.findAll(pageable)
            .map(exceptionalActivityMapper::toDto);
    }


    /**
     * Get one exceptionalActivity by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ExceptionalActivityDTO> findOne(Long id) {
        log.debug("Request to get ExceptionalActivity : {}", id);
        return exceptionalActivityRepository.findById(id)
            .map(exceptionalActivityMapper::toDto);
    }

    /**
     * Delete the exceptionalActivity by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ExceptionalActivity : {}", id);
        exceptionalActivityRepository.deleteById(id);
    }
}
