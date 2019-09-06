package com.zsoft.service;

import com.zsoft.domain.PersistedConfiguration;
import com.zsoft.repository.PersistedConfigurationRepository;
import com.zsoft.service.dto.PersistedConfigurationDTO;
import com.zsoft.service.mapper.PersistedConfigurationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing PersistedConfiguration.
 */
@Service
@Transactional
public class PersistedConfigurationService {

    private final Logger log = LoggerFactory.getLogger(PersistedConfigurationService.class);

    private final PersistedConfigurationRepository persistedConfigurationRepository;

    private final PersistedConfigurationMapper persistedConfigurationMapper;

    public PersistedConfigurationService(PersistedConfigurationRepository persistedConfigurationRepository, PersistedConfigurationMapper persistedConfigurationMapper) {
        this.persistedConfigurationRepository = persistedConfigurationRepository;
        this.persistedConfigurationMapper = persistedConfigurationMapper;
    }

    /**
     * Save a persistedConfiguration.
     *
     * @param persistedConfigurationDTO the entity to save
     * @return the persisted entity
     */
    public PersistedConfigurationDTO save(PersistedConfigurationDTO persistedConfigurationDTO) {
        log.debug("Request to save PersistedConfiguration : {}", persistedConfigurationDTO);
        PersistedConfiguration persistedConfiguration = persistedConfigurationMapper.toEntity(persistedConfigurationDTO);
        persistedConfiguration = persistedConfigurationRepository.save(persistedConfiguration);
        return persistedConfigurationMapper.toDto(persistedConfiguration);
    }

    /**
     * Get all the persistedConfigurations.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<PersistedConfigurationDTO> findAll(Pageable pageable) {
        log.debug("Request to get all PersistedConfigurations");
        return persistedConfigurationRepository.findAll(pageable)
            .map(persistedConfigurationMapper::toDto);
    }


    /**
     * Get one persistedConfiguration by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<PersistedConfigurationDTO> findOne(Long id) {
        log.debug("Request to get PersistedConfiguration : {}", id);
        return persistedConfigurationRepository.findById(id)
            .map(persistedConfigurationMapper::toDto);
    }

    /**
     * Delete the persistedConfiguration by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete PersistedConfiguration : {}", id);
        persistedConfigurationRepository.deleteById(id);
    }
}
