package com.zsoft.web.rest;
import com.zsoft.service.ResourceConfigurationService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.service.dto.ResourceConfigurationDTO;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing ResourceConfiguration.
 */
@RestController
@RequestMapping("/api")
public class ResourceConfigurationResource {

    private final Logger log = LoggerFactory.getLogger(ResourceConfigurationResource.class);

    private static final String ENTITY_NAME = "resourceConfiguration";

    private final ResourceConfigurationService resourceConfigurationService;

    public ResourceConfigurationResource(ResourceConfigurationService resourceConfigurationService) {
        this.resourceConfigurationService = resourceConfigurationService;
    }

    /**
     * POST  /resource-configurations : Create a new resourceConfiguration.
     *
     * @param resourceConfigurationDTO the resourceConfigurationDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new resourceConfigurationDTO, or with status 400 (Bad Request) if the resourceConfiguration has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/resource-configurations")
    public ResponseEntity<ResourceConfigurationDTO> createResourceConfiguration(@Valid @RequestBody ResourceConfigurationDTO resourceConfigurationDTO) throws URISyntaxException {
        log.debug("REST request to save ResourceConfiguration : {}", resourceConfigurationDTO);
        if (resourceConfigurationDTO.getId() != null) {
            throw new BadRequestAlertException("A new resourceConfiguration cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ResourceConfigurationDTO result = resourceConfigurationService.save(resourceConfigurationDTO);
        return ResponseEntity.created(new URI("/api/resource-configurations/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /resource-configurations : Updates an existing resourceConfiguration.
     *
     * @param resourceConfigurationDTO the resourceConfigurationDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated resourceConfigurationDTO,
     * or with status 400 (Bad Request) if the resourceConfigurationDTO is not valid,
     * or with status 500 (Internal Server Error) if the resourceConfigurationDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/resource-configurations")
    public ResponseEntity<ResourceConfigurationDTO> updateResourceConfiguration(@Valid @RequestBody ResourceConfigurationDTO resourceConfigurationDTO) throws URISyntaxException {
        log.debug("REST request to update ResourceConfiguration : {}", resourceConfigurationDTO);
        if (resourceConfigurationDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ResourceConfigurationDTO result = resourceConfigurationService.save(resourceConfigurationDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, resourceConfigurationDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /resource-configurations : get all the resourceConfigurations.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of resourceConfigurations in body
     */
    @GetMapping("/resource-configurations")
    public List<ResourceConfigurationDTO> getAllResourceConfigurations() {
        log.debug("REST request to get all ResourceConfigurations");
        return resourceConfigurationService.findAll();
    }

    /**
     * GET  /resource-configurations/:id : get the "id" resourceConfiguration.
     *
     * @param id the id of the resourceConfigurationDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the resourceConfigurationDTO, or with status 404 (Not Found)
     */
    @GetMapping("/resource-configurations/{id}")
    public ResponseEntity<ResourceConfigurationDTO> getResourceConfiguration(@PathVariable Long id) {
        log.debug("REST request to get ResourceConfiguration : {}", id);
        Optional<ResourceConfigurationDTO> resourceConfigurationDTO = resourceConfigurationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(resourceConfigurationDTO);
    }

    /**
     * DELETE  /resource-configurations/:id : delete the "id" resourceConfiguration.
     *
     * @param id the id of the resourceConfigurationDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/resource-configurations/{id}")
    public ResponseEntity<Void> deleteResourceConfiguration(@PathVariable Long id) {
        log.debug("REST request to delete ResourceConfiguration : {}", id);
        resourceConfigurationService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
