package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ResourceConfigurationDTO;
import com.zsoft.service.extensions.ResourceConfigurationServiceExt;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing ResourceConfiguration.
 */
@RestController
@RequestMapping("/api")
public class ResourceConfigurationResourceExt {

    private final Logger log = LoggerFactory.getLogger(ResourceConfigurationResourceExt.class);

    private final ResourceConfigurationServiceExt resourceConfigurationServiceExt;

    public ResourceConfigurationResourceExt(ResourceConfigurationServiceExt resourceConfigurationServiceExt) {
        this.resourceConfigurationServiceExt = resourceConfigurationServiceExt;
    }

    /**
     * GET  /resource-configurations : get the resourceConfiguration by resource.
     *
     * @param resourceId the id of the resource to retrieve resourceConfigurationDTO
     * @return the ResponseEntity with status 200 (OK) and with body the resourceConfigurationDTO, or with status 404 (Not Found)
     */
    @GetMapping(value = "/resource-configurations", params = {"resource_id"})
    public ResponseEntity<ResourceConfigurationDTO> getResourceConfiguration(@RequestParam("resource_id") Long resourceId) {
        log.debug("REST request to get ResourceConfiguration by resourceId : {}", resourceId);
        Optional<ResourceConfigurationDTO> resourceConfigurationDTO = resourceConfigurationServiceExt.findByResource(resourceId);
        return ResponseUtil.wrapOrNotFound(resourceConfigurationDTO);
    }

    /**
     * GET  /resource-configurations : get all the resourceConfigurations by resources.
     *
     * @param resourceIds the list of resource ids
     * @return the ResponseEntity with status 200 (OK) and the list of resourceConfigurations in body
     */
    @GetMapping(value = "/resource-configurations", params = {"resource_ids"})
    public List<ResourceConfigurationDTO> getAllResourceConfigurations(@RequestParam("resource_ids") List<Long> resourceIds) {
        log.debug("REST request to get all ResourceConfigurations by resources: {}", resourceIds);
        return resourceConfigurationServiceExt.findAllByResources(resourceIds);
    }
}
