package com.zsoft.web.rest;
import com.zsoft.service.StandardActivityService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.StandardActivityDTO;
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
 * REST controller for managing StandardActivity.
 */
@RestController
@RequestMapping("/api")
public class StandardActivityResource {

    private final Logger log = LoggerFactory.getLogger(StandardActivityResource.class);

    private static final String ENTITY_NAME = "standardActivity";

    private final StandardActivityService standardActivityService;

    public StandardActivityResource(StandardActivityService standardActivityService) {
        this.standardActivityService = standardActivityService;
    }

    /**
     * POST  /standard-activities : Create a new standardActivity.
     *
     * @param standardActivityDTO the standardActivityDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new standardActivityDTO, or with status 400 (Bad Request) if the standardActivity has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/standard-activities")
    public ResponseEntity<StandardActivityDTO> createStandardActivity(@Valid @RequestBody StandardActivityDTO standardActivityDTO) throws URISyntaxException {
        log.debug("REST request to save StandardActivity : {}", standardActivityDTO);
        if (standardActivityDTO.getId() != null) {
            throw new BadRequestAlertException("A new standardActivity cannot already have an ID", ENTITY_NAME, "idexists");
        }
        StandardActivityDTO result = standardActivityService.save(standardActivityDTO);
        return ResponseEntity.created(new URI("/api/standard-activities/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /standard-activities : Updates an existing standardActivity.
     *
     * @param standardActivityDTO the standardActivityDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated standardActivityDTO,
     * or with status 400 (Bad Request) if the standardActivityDTO is not valid,
     * or with status 500 (Internal Server Error) if the standardActivityDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/standard-activities")
    public ResponseEntity<StandardActivityDTO> updateStandardActivity(@Valid @RequestBody StandardActivityDTO standardActivityDTO) throws URISyntaxException {
        log.debug("REST request to update StandardActivity : {}", standardActivityDTO);
        if (standardActivityDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        StandardActivityDTO result = standardActivityService.save(standardActivityDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, standardActivityDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /standard-activities : get all the standardActivities.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of standardActivities in body
     */
    @GetMapping("/standard-activities")
    public ResponseEntity<List<StandardActivityDTO>> getAllStandardActivities(Pageable pageable) {
        log.debug("REST request to get a page of StandardActivities");
        Page<StandardActivityDTO> page = standardActivityService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/standard-activities");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /standard-activities/:id : get the "id" standardActivity.
     *
     * @param id the id of the standardActivityDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the standardActivityDTO, or with status 404 (Not Found)
     */
    @GetMapping("/standard-activities/{id}")
    public ResponseEntity<StandardActivityDTO> getStandardActivity(@PathVariable Long id) {
        log.debug("REST request to get StandardActivity : {}", id);
        Optional<StandardActivityDTO> standardActivityDTO = standardActivityService.findOne(id);
        return ResponseUtil.wrapOrNotFound(standardActivityDTO);
    }

    /**
     * DELETE  /standard-activities/:id : delete the "id" standardActivity.
     *
     * @param id the id of the standardActivityDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/standard-activities/{id}")
    public ResponseEntity<Void> deleteStandardActivity(@PathVariable Long id) {
        log.debug("REST request to delete StandardActivity : {}", id);
        standardActivityService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
