package com.zsoft.service;

import com.zsoft.domain.Constant;
import com.zsoft.repository.ConstantRepository;
import com.zsoft.service.dto.ConstantDTO;
import com.zsoft.service.mapper.ConstantMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing Constant.
 */
@Service
@Transactional
public class ConstantService {

    private final Logger log = LoggerFactory.getLogger(ConstantService.class);

    private final ConstantRepository constantRepository;

    private final ConstantMapper constantMapper;

    public ConstantService(ConstantRepository constantRepository, ConstantMapper constantMapper) {
        this.constantRepository = constantRepository;
        this.constantMapper = constantMapper;
    }

    /**
     * Save a constant.
     *
     * @param constantDTO the entity to save
     * @return the persisted entity
     */
    public ConstantDTO save(ConstantDTO constantDTO) {
        log.debug("Request to save Constant : {}", constantDTO);
        Constant constant = constantMapper.toEntity(constantDTO);
        constant = constantRepository.save(constant);
        return constantMapper.toDto(constant);
    }

    /**
     * Get all the constants.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ConstantDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Constants");
        return constantRepository.findAll(pageable)
            .map(constantMapper::toDto);
    }


    /**
     * Get one constant by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ConstantDTO> findOne(Long id) {
        log.debug("Request to get Constant : {}", id);
        return constantRepository.findById(id)
            .map(constantMapper::toDto);
    }

    /**
     * Delete the constant by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete Constant : {}", id);
        constantRepository.deleteById(id);
    }
}
