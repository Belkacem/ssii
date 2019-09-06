package com.zsoft.web.rest;
import com.zsoft.service.ExceptionalActivityService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ExceptionalActivityDTO;
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
 * REST controller for managing ExceptionalActivity.
 */
@RestController
@RequestMapping("/api")
public class ExceptionalActivityResource {

    private final Logger log = LoggerFactory.getLogger(ExceptionalActivityResource.class);

    private static final String ENTITY_NAME = "exceptionalActivity";

    private final ExceptionalActivityService exceptionalActivityService;

    public ExceptionalActivityResource(ExceptionalActivityService exceptionalActivityService) {
        this.exceptionalActivityService = exceptionalActivityService;
    }

    /**
     * POST  /exceptional-activities : Create a new exceptionalActivity.
     *
     * @param exceptionalActivityDTO the exceptionalActivityDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new exceptionalActivityDTO, or with status 400 (Bad Request) if the exceptionalActivity has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/exceptional-activities")
    public ResponseEntity<ExceptionalActivityDTO> createExceptionalActivity(@Valid @RequestBody ExceptionalActivityDTO exceptionalActivityDTO) throws URISyntaxException {
        log.debug("REST request to save ExceptionalActivity : {}", exceptionalActivityDTO);
        if (exceptionalActivityDTO.getId() != null) {
            throw new BadRequestAlertException("A new exceptionalActivity cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ExceptionalActivityDTO result = exceptionalActivityService.save(exceptionalActivityDTO);
        return ResponseEntity.created(new URI("/api/exceptional-activities/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /exceptional-activities : Updates an existing exceptionalActivity.
     *
     * @param exceptionalActivityDTO the exceptionalActivityDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated exceptionalActivityDTO,
     * or with status 400 (Bad Request) if the exceptionalActivityDTO is not valid,
     * or with status 500 (Internal Server Error) if the exceptionalActivityDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/exceptional-activities")
    public ResponseEntity<ExceptionalActivityDTO> updateExceptionalActivity(@Valid @RequestBody ExceptionalActivityDTO exceptionalActivityDTO) throws URISyntaxException {
        log.debug("REST request to update ExceptionalActivity : {}", exceptionalActivityDTO);
        if (exceptionalActivityDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ExceptionalActivityDTO result = exceptionalActivityService.save(exceptionalActivityDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, exceptionalActivityDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /exceptional-activities : get all the exceptionalActivities.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of exceptionalActivities in body
     */
    @GetMapping("/exceptional-activities")
    public ResponseEntity<List<ExceptionalActivityDTO>> getAllExceptionalActivities(Pageable pageable) {
        log.debug("REST request to get a page of ExceptionalActivities");
        Page<ExceptionalActivityDTO> page = exceptionalActivityService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/exceptional-activities");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /exceptional-activities/:id : get the "id" exceptionalActivity.
     *
     * @param id the id of the exceptionalActivityDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the exceptionalActivityDTO, or with status 404 (Not Found)
     */
    @GetMapping("/exceptional-activities/{id}")
    public ResponseEntity<ExceptionalActivityDTO> getExceptionalActivity(@PathVariable Long id) {
        log.debug("REST request to get ExceptionalActivity : {}", id);
        Optional<ExceptionalActivityDTO> exceptionalActivityDTO = exceptionalActivityService.findOne(id);
        return ResponseUtil.wrapOrNotFound(exceptionalActivityDTO);
    }

    /**
     * DELETE  /exceptional-activities/:id : delete the "id" exceptionalActivity.
     *
     * @param id the id of the exceptionalActivityDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/exceptional-activities/{id}")
    public ResponseEntity<Void> deleteExceptionalActivity(@PathVariable Long id) {
        log.debug("REST request to delete ExceptionalActivity : {}", id);
        exceptionalActivityService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
