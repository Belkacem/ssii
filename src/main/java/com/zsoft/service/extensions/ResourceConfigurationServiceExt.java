package com.zsoft.service.extensions;

import com.zsoft.domain.Resource;
import com.zsoft.domain.ResourceConfiguration;
import com.zsoft.repository.extensions.ResourceConfigurationRepositoryExt;
import com.zsoft.service.dto.ResourceConfigurationDTO;
import com.zsoft.service.mapper.ResourceConfigurationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing ResourceConfiguration.
 */
@Service
@Transactional
public class ResourceConfigurationServiceExt {

    private final Logger log = LoggerFactory.getLogger(ResourceConfigurationServiceExt.class);

    private final ResourceConfigurationRepositoryExt resourceConfigurationRepositoryExt;

    private final ResourceConfigurationMapper resourceConfigurationMapper;

    public ResourceConfigurationServiceExt(ResourceConfigurationRepositoryExt resourceConfigurationRepositoryExt, ResourceConfigurationMapper resourceConfigurationMapper) {
        this.resourceConfigurationRepositoryExt = resourceConfigurationRepositoryExt;
        this.resourceConfigurationMapper = resourceConfigurationMapper;
    }

    /**
     * Create a new resourceConfiguration.
     *
     * @param resource the resouce
     * @return the persisted entity
     */
    public ResourceConfigurationDTO create(Resource resource) {
        log.debug("Request to create a new ResourceConfiguration for Resource : {}", resource);
        ResourceConfiguration resourceConfiguration = new ResourceConfiguration()
            .resource(resource)
            .active(true)
            .canReportExpenses(false)
            .hasRTT(false);
        resourceConfiguration = resourceConfigurationRepositoryExt.save(resourceConfiguration);
        return resourceConfigurationMapper.toDto(resourceConfiguration);
    }


    /**
     * Get one resourceConfiguration by resourceId.
     *
     * @param resourceId the id of the resource
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ResourceConfigurationDTO> findByResource(Long resourceId) {
        log.debug("Request to get ResourceConfiguration by Resource Id : {}", resourceId);
        return resourceConfigurationRepositoryExt.findByResourceId(resourceId)
            .map(resourceConfigurationMapper::toDto);
    }

    /**
     * Get all the resourceConfigurations by resources.
     *
     * @param resourceIds the list of resource ids
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public List<ResourceConfigurationDTO> findAllByResources(List<Long> resourceIds) {
        log.debug("Request to get all ResourceConfigurations by resources: {}", resourceIds);
        return resourceConfigurationRepositoryExt.findAllByResource_IdIn(resourceIds)
            .stream()
            .map(resourceConfigurationMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Delete the resourceConfiguration by resource.
     *
     * @param resource the resource
     */
    public void deleteByResource(Resource resource) {
        log.debug("Request to delete ResourceConfiguration by Resource Id : {}", resource);
        resourceConfigurationRepositoryExt
            .findByResourceId(resource.getId())
            .ifPresent(resourceConfigurationRepositoryExt::delete);
    }
}
