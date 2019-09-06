package com.zsoft.service;

import com.zsoft.domain.ResourceContract;
import com.zsoft.repository.ResourceContractRepository;
import com.zsoft.service.dto.ResourceContractDTO;
import com.zsoft.service.mapper.ResourceContractMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing ResourceContract.
 */
@Service
@Transactional
public class ResourceContractService {

    private final Logger log = LoggerFactory.getLogger(ResourceContractService.class);

    private final ResourceContractRepository resourceContractRepository;

    private final ResourceContractMapper resourceContractMapper;

    public ResourceContractService(ResourceContractRepository resourceContractRepository, ResourceContractMapper resourceContractMapper) {
        this.resourceContractRepository = resourceContractRepository;
        this.resourceContractMapper = resourceContractMapper;
    }

    /**
     * Save a resourceContract.
     *
     * @param resourceContractDTO the entity to save
     * @return the persisted entity
     */
    public ResourceContractDTO save(ResourceContractDTO resourceContractDTO) {
        log.debug("Request to save ResourceContract : {}", resourceContractDTO);
        ResourceContract resourceContract = resourceContractMapper.toEntity(resourceContractDTO);
        resourceContract = resourceContractRepository.save(resourceContract);
        return resourceContractMapper.toDto(resourceContract);
    }

    /**
     * Get all the resourceContracts.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ResourceContractDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ResourceContracts");
        return resourceContractRepository.findAll(pageable)
            .map(resourceContractMapper::toDto);
    }


    /**
     * Get one resourceContract by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ResourceContractDTO> findOne(Long id) {
        log.debug("Request to get ResourceContract : {}", id);
        return resourceContractRepository.findById(id)
            .map(resourceContractMapper::toDto);
    }

    /**
     * Delete the resourceContract by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete ResourceContract : {}", id);
        resourceContractRepository.deleteById(id);
    }
}
