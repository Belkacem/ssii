package com.zsoft.service;

import com.zsoft.domain.StandardActivity;
import com.zsoft.repository.StandardActivityRepository;
import com.zsoft.service.dto.StandardActivityDTO;
import com.zsoft.service.mapper.StandardActivityMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing StandardActivity.
 */
@Service
@Transactional
public class StandardActivityService {

    private final Logger log = LoggerFactory.getLogger(StandardActivityService.class);

    private final StandardActivityRepository standardActivityRepository;

    private final StandardActivityMapper standardActivityMapper;

    public StandardActivityService(StandardActivityRepository standardActivityRepository, StandardActivityMapper standardActivityMapper) {
        this.standardActivityRepository = standardActivityRepository;
        this.standardActivityMapper = standardActivityMapper;
    }

    /**
     * Save a standardActivity.
     *
     * @param standardActivityDTO the entity to save
     * @return the persisted entity
     */
    public StandardActivityDTO save(StandardActivityDTO standardActivityDTO) {
        log.debug("Request to save StandardActivity : {}", standardActivityDTO);
        StandardActivity standardActivity = standardActivityMapper.toEntity(standardActivityDTO);
        standardActivity = standardActivityRepository.save(standardActivity);
        return standardActivityMapper.toDto(standardActivity);
    }

    /**
     * Get all the standardActivities.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<StandardActivityDTO> findAll(Pageable pageable) {
        log.debug("Request to get all StandardActivities");
        return standardActivityRepository.findAll(pageable)
            .map(standardActivityMapper::toDto);
    }


    /**
     * Get one standardActivity by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<StandardActivityDTO> findOne(Long id) {
        log.debug("Request to get StandardActivity : {}", id);
        return standardActivityRepository.findById(id)
            .map(standardActivityMapper::toDto);
    }

    /**
     * Delete the standardActivity by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete StandardActivity : {}", id);
        standardActivityRepository.deleteById(id);
    }
}
