package com.zsoft.service;

import com.zsoft.domain.ExpenseType;
import com.zsoft.repository.ExpenseTypeRepository;
import com.zsoft.service.dto.ExpenseTypeDTO;
import com.zsoft.service.mapper.ExpenseTypeMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing ExpenseType.
 */
@Service
@Transactional
public class ExpenseTypeService {

    private final Logger log = LoggerFactory.getLogger(ExpenseTypeService.class);

    private final ExpenseTypeRepository expenseTypeRepository;

    private final ExpenseTypeMapper expenseTypeMapper;

    public ExpenseTypeService(ExpenseTypeRepository expenseTypeRepository, ExpenseTypeMapper expenseTypeMapper) {
        this.expenseTypeRepository = expenseTypeRepository;
        this.expenseTypeMapper = expenseTypeMapper;
    }

    /**
     * Save a expenseType.
     *
     * @param expenseTypeDTO the entity to save
     * @return the persisted entity
     */
    public ExpenseTypeDTO save(ExpenseTypeDTO expenseTypeDTO) {
        log.debug("Request to save ExpenseType : {}", expenseTypeDTO);
        ExpenseType expenseType = expenseTypeMapper.toEntity(expenseTypeDTO);
        expenseType = expenseTypeRepository.save(expenseType);
        return expenseTypeMapper.toDto(expenseType);
    }

    /**
     * Get all the expenseTypes.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ExpenseTypeDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ExpenseTypes");
        return expenseTypeRepository.findAll(pageable)
            .map(expenseTypeMapper::toDto);
    }


    /**
     * Get one expenseType by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ExpenseTypeDTO> findOne(Long id) {
        log.debug("Request to get ExpenseType : {}", id);
        return expenseTypeRepository.findById(id)
            .map(expenseTypeMapper::toDto);
    }

    /**
     * Delete the expenseType by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ExpenseType : {}", id);
        expenseTypeRepository.deleteById(id);
    }
}
