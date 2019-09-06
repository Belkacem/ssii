package com.zsoft.service;

import com.zsoft.domain.AbsenceValidator;
import com.zsoft.repository.AbsenceValidatorRepository;
import com.zsoft.service.dto.AbsenceValidatorDTO;
import com.zsoft.service.mapper.AbsenceValidatorMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing AbsenceValidator.
 */
@Service
@Transactional
public class AbsenceValidatorService {

    private final Logger log = LoggerFactory.getLogger(AbsenceValidatorService.class);

    private final AbsenceValidatorRepository absenceValidatorRepository;

    private final AbsenceValidatorMapper absenceValidatorMapper;

    public AbsenceValidatorService(AbsenceValidatorRepository absenceValidatorRepository, AbsenceValidatorMapper absenceValidatorMapper) {
        this.absenceValidatorRepository = absenceValidatorRepository;
        this.absenceValidatorMapper = absenceValidatorMapper;
    }

    /**
     * Save a absenceValidator.
     *
     * @param absenceValidatorDTO the entity to save
     * @return the persisted entity
     */
    public AbsenceValidatorDTO save(AbsenceValidatorDTO absenceValidatorDTO) {
        log.debug("Request to save AbsenceValidator : {}", absenceValidatorDTO);
        AbsenceValidator absenceValidator = absenceValidatorMapper.toEntity(absenceValidatorDTO);
        absenceValidator = absenceValidatorRepository.save(absenceValidator);
        return absenceValidatorMapper.toDto(absenceValidator);
    }

    /**
     * Get all the absenceValidators.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceValidatorDTO> findAll(Pageable pageable) {
        log.debug("Request to get all AbsenceValidators");
        return absenceValidatorRepository.findAll(pageable)
            .map(absenceValidatorMapper::toDto);
    }

    /**
     * Get all the AbsenceValidator with eager load of many-to-many relationships.
     *
     * @return the list of entities
     */
    public Page<AbsenceValidatorDTO> findAllWithEagerRelationships(Pageable pageable) {
        return absenceValidatorRepository.findAllWithEagerRelationships(pageable).map(absenceValidatorMapper::toDto);
    }
    

    /**
     * Get one absenceValidator by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<AbsenceValidatorDTO> findOne(Long id) {
        log.debug("Request to get AbsenceValidator : {}", id);
        return absenceValidatorRepository.findOneWithEagerRelationships(id)
            .map(absenceValidatorMapper::toDto);
    }

    /**
     * Delete the absenceValidator by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete AbsenceValidator : {}", id);
        absenceValidatorRepository.deleteById(id);
    }
}
