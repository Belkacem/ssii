package com.zsoft.service;

import com.zsoft.domain.AbsenceBalanceAdjustment;
import com.zsoft.repository.AbsenceBalanceAdjustmentRepository;
import com.zsoft.service.dto.AbsenceBalanceAdjustmentDTO;
import com.zsoft.service.mapper.AbsenceBalanceAdjustmentMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing AbsenceBalanceAdjustment.
 */
@Service
@Transactional
public class AbsenceBalanceAdjustmentService {

    private final Logger log = LoggerFactory.getLogger(AbsenceBalanceAdjustmentService.class);

    private final AbsenceBalanceAdjustmentRepository absenceBalanceAdjustmentRepository;

    private final AbsenceBalanceAdjustmentMapper absenceBalanceAdjustmentMapper;

    public AbsenceBalanceAdjustmentService(AbsenceBalanceAdjustmentRepository absenceBalanceAdjustmentRepository, AbsenceBalanceAdjustmentMapper absenceBalanceAdjustmentMapper) {
        this.absenceBalanceAdjustmentRepository = absenceBalanceAdjustmentRepository;
        this.absenceBalanceAdjustmentMapper = absenceBalanceAdjustmentMapper;
    }

    /**
     * Save a absenceBalanceAdjustment.
     *
     * @param absenceBalanceAdjustmentDTO the entity to save
     * @return the persisted entity
     */
    public AbsenceBalanceAdjustmentDTO save(AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO) {
        log.debug("Request to save AbsenceBalanceAdjustment : {}", absenceBalanceAdjustmentDTO);
        AbsenceBalanceAdjustment absenceBalanceAdjustment = absenceBalanceAdjustmentMapper.toEntity(absenceBalanceAdjustmentDTO);
        absenceBalanceAdjustment = absenceBalanceAdjustmentRepository.save(absenceBalanceAdjustment);
        return absenceBalanceAdjustmentMapper.toDto(absenceBalanceAdjustment);
    }

    /**
     * Get all the absenceBalanceAdjustments.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceBalanceAdjustmentDTO> findAll(Pageable pageable) {
        log.debug("Request to get all AbsenceBalanceAdjustments");
        return absenceBalanceAdjustmentRepository.findAll(pageable)
            .map(absenceBalanceAdjustmentMapper::toDto);
    }


    /**
     * Get one absenceBalanceAdjustment by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<AbsenceBalanceAdjustmentDTO> findOne(Long id) {
        log.debug("Request to get AbsenceBalanceAdjustment : {}", id);
        return absenceBalanceAdjustmentRepository.findById(id)
            .map(absenceBalanceAdjustmentMapper::toDto);
    }

    /**
     * Delete the absenceBalanceAdjustment by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete AbsenceBalanceAdjustment : {}", id);
        absenceBalanceAdjustmentRepository.deleteById(id);
    }
}
