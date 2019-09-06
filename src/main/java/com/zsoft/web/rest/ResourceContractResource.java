package com.zsoft.web.rest;
import com.zsoft.service.ResourceContractService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ResourceContractDTO;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing ResourceContract.
 */
@RestController
@RequestMapping("/api")
public class ResourceContractResource {

    private final Logger log = LoggerFactory.getLogger(ResourceContractResource.class);

    private static final String ENTITY_NAME = "resourceContract";

    private final ResourceContractService resourceContractService;

    public ResourceContractResource(ResourceContractService resourceContractService) {
        this.resourceContractService = resourceContractService;
    }

    /**
     * POST  /resource-contracts : Create a new resourceContract.
     *
     * @param resourceContractDTO the resourceContractDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new resourceContractDTO, or with status 400 (Bad Request) if the resourceContract has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/resource-contracts")
    public ResponseEntity<ResourceContractDTO> createResourceContract(@Valid @RequestBody ResourceContractDTO resourceContractDTO) throws URISyntaxException {
        log.debug("REST request to save ResourceContract : {}", resourceContractDTO);
        if (resourceContractDTO.getId() != null) {
            throw new BadRequestAlertException("A new resourceContract cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ResourceContractDTO result = resourceContractService.save(resourceContractDTO);
        return ResponseEntity.created(new URI("/api/resource-contracts/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /resource-contracts : Updates an existing resourceContract.
     *
     * @param resourceContractDTO the resourceContractDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated resourceContractDTO,
     * or with status 400 (Bad Request) if the resourceContractDTO is not valid,
     * or with status 500 (Internal Server Error) if the resourceContractDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/resource-contracts")
    public ResponseEntity<ResourceContractDTO> updateResourceContract(@Valid @RequestBody ResourceContractDTO resourceContractDTO) throws URISyntaxException {
        log.debug("REST request to update ResourceContract : {}", resourceContractDTO);
        if (resourceContractDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ResourceContractDTO result = resourceContractService.save(resourceContractDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, resourceContractDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /resource-contracts : get all the resourceContracts.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of resourceContracts in body
     */
    @GetMapping("/resource-contracts")
    public ResponseEntity<List<ResourceContractDTO>> getAllResourceContracts(Pageable pageable) {
        log.debug("REST request to get a page of ResourceContracts");
        Page<ResourceContractDTO> page = resourceContractService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/resource-contracts");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /resource-contracts/:id : get the "id" resourceContract.
     *
     * @param id the id of the resourceContractDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the resourceContractDTO, or with status 404 (Not Found)
     */
    @GetMapping("/resource-contracts/{id}")
    public ResponseEntity<ResourceContractDTO> getResourceContract(@PathVariable Long id) {
        log.debug("REST request to get ResourceContract : {}", id);
        Optional<ResourceContractDTO> resourceContractDTO = resourceContractService.findOne(id);
        return ResponseUtil.wrapOrNotFound(resourceContractDTO);
    }

    /**
     * DELETE  /resource-contracts/:id : delete the "id" resourceContract.
     *
     * @param id the id of the resourceContractDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/resource-contracts/{id}")
    public ResponseEntity<Void> deleteResourceContract(@PathVariable Long id) {
        log.debug("REST request to delete ResourceContract : {}", id);
        resourceContractService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
