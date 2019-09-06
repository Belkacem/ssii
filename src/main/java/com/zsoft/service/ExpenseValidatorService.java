package com.zsoft.service;

import com.zsoft.domain.ExpenseValidator;
import com.zsoft.repository.ExpenseValidatorRepository;
import com.zsoft.service.dto.ExpenseValidatorDTO;
import com.zsoft.service.mapper.ExpenseValidatorMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing ExpenseValidator.
 */
@Service
@Transactional
public class ExpenseValidatorService {

    private final Logger log = LoggerFactory.getLogger(ExpenseValidatorService.class);

    private final ExpenseValidatorRepository expenseValidatorRepository;

    private final ExpenseValidatorMapper expenseValidatorMapper;

    public ExpenseValidatorService(ExpenseValidatorRepository expenseValidatorRepository, ExpenseValidatorMapper expenseValidatorMapper) {
        this.expenseValidatorRepository = expenseValidatorRepository;
        this.expenseValidatorMapper = expenseValidatorMapper;
    }

    /**
     * Save a expenseValidator.
     *
     * @param expenseValidatorDTO the entity to save
     * @return the persisted entity
     */
    public ExpenseValidatorDTO save(ExpenseValidatorDTO expenseValidatorDTO) {
        log.debug("Request to save ExpenseValidator : {}", expenseValidatorDTO);
        ExpenseValidator expenseValidator = expenseValidatorMapper.toEntity(expenseValidatorDTO);
        expenseValidator = expenseValidatorRepository.save(expenseValidator);
        return expenseValidatorMapper.toDto(expenseValidator);
    }

    /**
     * Get all the expenseValidators.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ExpenseValidatorDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ExpenseValidators");
        return expenseValidatorRepository.findAll(pageable)
            .map(expenseValidatorMapper::toDto);
    }


    /**
     * Get one expenseValidator by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ExpenseValidatorDTO> findOne(Long id) {
        log.debug("Request to get ExpenseValidator : {}", id);
        return expenseValidatorRepository.findById(id)
            .map(expenseValidatorMapper::toDto);
    }

    /**
     * Delete the expenseValidator by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ExpenseValidator : {}", id);
        expenseValidatorRepository.deleteById(id);
    }
}
