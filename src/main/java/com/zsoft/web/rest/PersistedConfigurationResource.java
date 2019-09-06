package com.zsoft.web.rest;
import com.zsoft.service.PersistedConfigurationService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.PersistedConfigurationDTO;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing PersistedConfiguration.
 */
@RestController
@RequestMapping("/api")
public class PersistedConfigurationResource {

    private final Logger log = LoggerFactory.getLogger(PersistedConfigurationResource.class);

    private static final String ENTITY_NAME = "persistedConfiguration";

    private final PersistedConfigurationService persistedConfigurationService;

    public PersistedConfigurationResource(PersistedConfigurationService persistedConfigurationService) {
        this.persistedConfigurationService = persistedConfigurationService;
    }

    /**
     * POST  /persisted-configurations : Create a new persistedConfiguration.
     *
     * @param persistedConfigurationDTO the persistedConfigurationDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new persistedConfigurationDTO, or with status 400 (Bad Request) if the persistedConfiguration has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/persisted-configurations")
    public ResponseEntity<PersistedConfigurationDTO> createPersistedConfiguration(@RequestBody PersistedConfigurationDTO persistedConfigurationDTO) throws URISyntaxException {
        log.debug("REST request to save PersistedConfiguration : {}", persistedConfigurationDTO);
        if (persistedConfigurationDTO.getId() != null) {
            throw new BadRequestAlertException("A new persistedConfiguration cannot already have an ID", ENTITY_NAME, "idexists");
        }
        PersistedConfigurationDTO result = persistedConfigurationService.save(persistedConfigurationDTO);
        return ResponseEntity.created(new URI("/api/persisted-configurations/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /persisted-configurations : Updates an existing persistedConfiguration.
     *
     * @param persistedConfigurationDTO the persistedConfigurationDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated persistedConfigurationDTO,
     * or with status 400 (Bad Request) if the persistedConfigurationDTO is not valid,
     * or with status 500 (Internal Server Error) if the persistedConfigurationDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/persisted-configurations")
    public ResponseEntity<PersistedConfigurationDTO> updatePersistedConfiguration(@RequestBody PersistedConfigurationDTO persistedConfigurationDTO) throws URISyntaxException {
        log.debug("REST request to update PersistedConfiguration : {}", persistedConfigurationDTO);
        if (persistedConfigurationDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        PersistedConfigurationDTO result = persistedConfigurationService.save(persistedConfigurationDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, persistedConfigurationDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /persisted-configurations : get all the persistedConfigurations.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of persistedConfigurations in body
     */
    @GetMapping("/persisted-configurations")
    public ResponseEntity<List<PersistedConfigurationDTO>> getAllPersistedConfigurations(Pageable pageable) {
        log.debug("REST request to get a page of PersistedConfigurations");
        Page<PersistedConfigurationDTO> page = persistedConfigurationService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/persisted-configurations");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /persisted-configurations/:id : get the "id" persistedConfiguration.
     *
     * @param id the id of the persistedConfigurationDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the persistedConfigurationDTO, or with status 404 (Not Found)
     */
    @GetMapping("/persisted-configurations/{id}")
    public ResponseEntity<PersistedConfigurationDTO> getPersistedConfiguration(@PathVariable Long id) {
        log.debug("REST request to get PersistedConfiguration : {}", id);
        Optional<PersistedConfigurationDTO> persistedConfigurationDTO = persistedConfigurationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(persistedConfigurationDTO);
    }

    /**
     * DELETE  /persisted-configurations/:id : delete the "id" persistedConfiguration.
     *
     * @param id the id of the persistedConfigurationDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/persisted-configurations/{id}")
    public ResponseEntity<Void> deletePersistedConfiguration(@PathVariable Long id) {
        log.debug("REST request to delete PersistedConfiguration : {}", id);
        persistedConfigurationService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
