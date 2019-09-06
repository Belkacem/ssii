package com.zsoft.service;

import com.zsoft.domain.AbsenceBalance;
import com.zsoft.repository.AbsenceBalanceRepository;
import com.zsoft.service.dto.AbsenceBalanceDTO;
import com.zsoft.service.mapper.AbsenceBalanceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing AbsenceBalance.
 */
@Service
@Transactional
public class AbsenceBalanceService {

    private final Logger log = LoggerFactory.getLogger(AbsenceBalanceService.class);

    private final AbsenceBalanceRepository absenceBalanceRepository;

    private final AbsenceBalanceMapper absenceBalanceMapper;

    public AbsenceBalanceService(AbsenceBalanceRepository absenceBalanceRepository, AbsenceBalanceMapper absenceBalanceMapper) {
        this.absenceBalanceRepository = absenceBalanceRepository;
        this.absenceBalanceMapper = absenceBalanceMapper;
    }

    /**
     * Save a absenceBalance.
     *
     * @param absenceBalanceDTO the entity to save
     * @return the persisted entity
     */
    public AbsenceBalanceDTO save(AbsenceBalanceDTO absenceBalanceDTO) {
        log.debug("Request to save AbsenceBalance : {}", absenceBalanceDTO);
        AbsenceBalance absenceBalance = absenceBalanceMapper.toEntity(absenceBalanceDTO);
        absenceBalance = absenceBalanceRepository.save(absenceBalance);
        return absenceBalanceMapper.toDto(absenceBalance);
    }

    /**
     * Get all the absenceBalances.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceBalanceDTO> findAll(Pageable pageable) {
        log.debug("Request to get all AbsenceBalances");
        return absenceBalanceRepository.findAll(pageable)
            .map(absenceBalanceMapper::toDto);
    }


    /**
     * Get one absenceBalance by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<AbsenceBalanceDTO> findOne(Long id) {
        log.debug("Request to get AbsenceBalance : {}", id);
        return absenceBalanceRepository.findById(id)
            .map(absenceBalanceMapper::toDto);
    }

    /**
     * Delete the absenceBalance by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete AbsenceBalance : {}", id);
        absenceBalanceRepository.deleteById(id);
    }
}
