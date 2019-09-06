package com.zsoft.service;

import com.zsoft.domain.AbsenceType;
import com.zsoft.repository.AbsenceTypeRepository;
import com.zsoft.service.dto.AbsenceTypeDTO;
import com.zsoft.service.mapper.AbsenceTypeMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing AbsenceType.
 */
@Service
@Transactional
public class AbsenceTypeService {

    private final Logger log = LoggerFactory.getLogger(AbsenceTypeService.class);

    private final AbsenceTypeRepository absenceTypeRepository;

    private final AbsenceTypeMapper absenceTypeMapper;

    public AbsenceTypeService(AbsenceTypeRepository absenceTypeRepository, AbsenceTypeMapper absenceTypeMapper) {
        this.absenceTypeRepository = absenceTypeRepository;
        this.absenceTypeMapper = absenceTypeMapper;
    }

    /**
     * Save a absenceType.
     *
     * @param absenceTypeDTO the entity to save
     * @return the persisted entity
     */
    public AbsenceTypeDTO save(AbsenceTypeDTO absenceTypeDTO) {
        log.debug("Request to save AbsenceType : {}", absenceTypeDTO);
        AbsenceType absenceType = absenceTypeMapper.toEntity(absenceTypeDTO);
        absenceType = absenceTypeRepository.save(absenceType);
        return absenceTypeMapper.toDto(absenceType);
    }

    /**
     * Get all the absenceTypes.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceTypeDTO> findAll(Pageable pageable) {
        log.debug("Request to get all AbsenceTypes");
        return absenceTypeRepository.findAll(pageable)
            .map(absenceTypeMapper::toDto);
    }


    /**
     * Get one absenceType by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<AbsenceTypeDTO> findOne(Long id) {
        log.debug("Request to get AbsenceType : {}", id);
        return absenceTypeRepository.findById(id)
            .map(absenceTypeMapper::toDto);
    }

    /**
     * Delete the absenceType by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete AbsenceType : {}", id);
        absenceTypeRepository.deleteById(id);
    }
}
