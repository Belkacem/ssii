package com.zsoft.service.extensions;

import com.zsoft.repository.extensions.ResourceContractRepositoryExt;
import com.zsoft.service.dto.ResourceContractDTO;
import com.zsoft.service.mapper.ResourceContractMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing ResourceContract.
 */
@Service
@Transactional
public class ResourceContractServiceExt {

    private final Logger log = LoggerFactory.getLogger(ResourceContractServiceExt.class);

    private final ResourceContractRepositoryExt resourceContractRepositoryExt;

    private final ResourceContractMapper resourceContractMapper;

    public ResourceContractServiceExt(ResourceContractRepositoryExt resourceContractRepositoryExt, ResourceContractMapper resourceContractMapper) {
        this.resourceContractRepositoryExt = resourceContractRepositoryExt;
        this.resourceContractMapper = resourceContractMapper;
    }

    /**
     * Get all the resourceContracts by Resource ID.
     *
     * @param pageable   the pagination information
     * @param resourceId the id of resource
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ResourceContractDTO> findAllByResource(Pageable pageable, Long resourceId) {
        log.debug("Request to get all ResourceContracts by resourceId: {}", resourceId);
        return resourceContractRepositoryExt.findAllByResource_Id(resourceId, pageable)
            .map(resourceContractMapper::toDto);
    }

    /**
     * Get all the resourceContracts By company ID.
     *
     * @param pageable   the pagination information
     * @param companyId the id of resource company
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ResourceContractDTO> findAllByCompany(Pageable pageable, Long companyId) {
        log.debug("Request to get all ResourceContracts by companyId: {}", companyId);
        return resourceContractRepositoryExt.findAllByResource_CompanyId(companyId, pageable)
            .map(resourceContractMapper::toDto);
    }
}
