package com.zsoft.service;

import com.zsoft.domain.ResourceConfiguration;
import com.zsoft.repository.ResourceConfigurationRepository;
import com.zsoft.service.dto.ResourceConfigurationDTO;
import com.zsoft.service.mapper.ResourceConfigurationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing ResourceConfiguration.
 */
@Service
@Transactional
public class ResourceConfigurationService {

    private final Logger log = LoggerFactory.getLogger(ResourceConfigurationService.class);

    private final ResourceConfigurationRepository resourceConfigurationRepository;

    private final ResourceConfigurationMapper resourceConfigurationMapper;

    public ResourceConfigurationService(ResourceConfigurationRepository resourceConfigurationRepository, ResourceConfigurationMapper resourceConfigurationMapper) {
        this.resourceConfigurationRepository = resourceConfigurationRepository;
        this.resourceConfigurationMapper = resourceConfigurationMapper;
    }

    /**
     * Save a resourceConfiguration.
     *
     * @param resourceConfigurationDTO the entity to save
     * @return the persisted entity
     */
    public ResourceConfigurationDTO save(ResourceConfigurationDTO resourceConfigurationDTO) {
        log.debug("Request to save ResourceConfiguration : {}", resourceConfigurationDTO);
        ResourceConfiguration resourceConfiguration = resourceConfigurationMapper.toEntity(resourceConfigurationDTO);
        resourceConfiguration = resourceConfigurationRepository.save(resourceConfiguration);
        return resourceConfigurationMapper.toDto(resourceConfiguration);
    }

    /**
     * Get all the resourceConfigurations.
     *
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public List<ResourceConfigurationDTO> findAll() {
        log.debug("Request to get all ResourceConfigurations");
        return resourceConfigurationRepository.findAll().stream()
            .map(resourceConfigurationMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one resourceConfiguration by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ResourceConfigurationDTO> findOne(Long id) {
        log.debug("Request to get ResourceConfiguration : {}", id);
        return resourceConfigurationRepository.findById(id)
            .map(resourceConfigurationMapper::toDto);
    }

    /**
     * Delete the resourceConfiguration by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ResourceConfiguration : {}", id);
        resourceConfigurationRepository.deleteById(id);
    }
}
