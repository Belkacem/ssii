package com.zsoft.service;

import com.zsoft.domain.ExpenseJustification;
import com.zsoft.repository.ExpenseJustificationRepository;
import com.zsoft.service.dto.ExpenseJustificationDTO;
import com.zsoft.service.mapper.ExpenseJustificationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing ExpenseJustification.
 */
@Service
@Transactional
public class ExpenseJustificationService {

    private final Logger log = LoggerFactory.getLogger(ExpenseJustificationService.class);

    private final ExpenseJustificationRepository expenseJustificationRepository;

    private final ExpenseJustificationMapper expenseJustificationMapper;

    public ExpenseJustificationService(ExpenseJustificationRepository expenseJustificationRepository, ExpenseJustificationMapper expenseJustificationMapper) {
        this.expenseJustificationRepository = expenseJustificationRepository;
        this.expenseJustificationMapper = expenseJustificationMapper;
    }

    /**
     * Save a expenseJustification.
     *
     * @param expenseJustificationDTO the entity to save
     * @return the persisted entity
     */
    public ExpenseJustificationDTO save(ExpenseJustificationDTO expenseJustificationDTO) {
        log.debug("Request to save ExpenseJustification : {}", expenseJustificationDTO);
        ExpenseJustification expenseJustification = expenseJustificationMapper.toEntity(expenseJustificationDTO);
        expenseJustification = expenseJustificationRepository.save(expenseJustification);
        return expenseJustificationMapper.toDto(expenseJustification);
    }

    /**
     * Get all the expenseJustifications.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ExpenseJustificationDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ExpenseJustifications");
        return expenseJustificationRepository.findAll(pageable)
            .map(expenseJustificationMapper::toDto);
    }


    /**
     * Get one expenseJustification by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ExpenseJustificationDTO> findOne(Long id) {
        log.debug("Request to get ExpenseJustification : {}", id);
        return expenseJustificationRepository.findById(id)
            .map(expenseJustificationMapper::toDto);
    }

    /**
     * Delete the expenseJustification by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ExpenseJustification : {}", id);
        expenseJustificationRepository.deleteById(id);
    }
}
