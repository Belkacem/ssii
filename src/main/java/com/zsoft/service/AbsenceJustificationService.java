package com.zsoft.service;

import com.zsoft.domain.AbsenceJustification;
import com.zsoft.repository.AbsenceJustificationRepository;
import com.zsoft.service.dto.AbsenceJustificationDTO;
import com.zsoft.service.mapper.AbsenceJustificationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing AbsenceJustification.
 */
@Service
@Transactional
public class AbsenceJustificationService {

    private final Logger log = LoggerFactory.getLogger(AbsenceJustificationService.class);

    private final AbsenceJustificationRepository absenceJustificationRepository;

    private final AbsenceJustificationMapper absenceJustificationMapper;

    public AbsenceJustificationService(AbsenceJustificationRepository absenceJustificationRepository, AbsenceJustificationMapper absenceJustificationMapper) {
        this.absenceJustificationRepository = absenceJustificationRepository;
        this.absenceJustificationMapper = absenceJustificationMapper;
    }

    /**
     * Save a absenceJustification.
     *
     * @param absenceJustificationDTO the entity to save
     * @return the persisted entity
     */
    public AbsenceJustificationDTO save(AbsenceJustificationDTO absenceJustificationDTO) {
        log.debug("Request to save AbsenceJustification : {}", absenceJustificationDTO);
        AbsenceJustification absenceJustification = absenceJustificationMapper.toEntity(absenceJustificationDTO);
        absenceJustification = absenceJustificationRepository.save(absenceJustification);
        return absenceJustificationMapper.toDto(absenceJustification);
    }

    /**
     * Get all the absenceJustifications.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceJustificationDTO> findAll(Pageable pageable) {
        log.debug("Request to get all AbsenceJustifications");
        return absenceJustificationRepository.findAll(pageable)
            .map(absenceJustificationMapper::toDto);
    }


    /**
     * Get one absenceJustification by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<AbsenceJustificationDTO> findOne(Long id) {
        log.debug("Request to get AbsenceJustification : {}", id);
        return absenceJustificationRepository.findById(id)
            .map(absenceJustificationMapper::toDto);
    }

    /**
     * Delete the absenceJustification by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete AbsenceJustification : {}", id);
        absenceJustificationRepository.deleteById(id);
    }
}
