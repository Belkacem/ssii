package com.zsoft.web.rest;
import com.zsoft.service.AbsenceValidatorService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.AbsenceValidatorDTO;
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
 * REST controller for managing AbsenceValidator.
 */
@RestController
@RequestMapping("/api")
public class AbsenceValidatorResource {

    private final Logger log = LoggerFactory.getLogger(AbsenceValidatorResource.class);

    private static final String ENTITY_NAME = "absenceValidator";

    private final AbsenceValidatorService absenceValidatorService;

    public AbsenceValidatorResource(AbsenceValidatorService absenceValidatorService) {
        this.absenceValidatorService = absenceValidatorService;
    }

    /**
     * POST  /absence-validators : Create a new absenceValidator.
     *
     * @param absenceValidatorDTO the absenceValidatorDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new absenceValidatorDTO, or with status 400 (Bad Request) if the absenceValidator has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/absence-validators")
    public ResponseEntity<AbsenceValidatorDTO> createAbsenceValidator(@Valid @RequestBody AbsenceValidatorDTO absenceValidatorDTO) throws URISyntaxException {
        log.debug("REST request to save AbsenceValidator : {}", absenceValidatorDTO);
        if (absenceValidatorDTO.getId() != null) {
            throw new BadRequestAlertException("A new absenceValidator cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AbsenceValidatorDTO result = absenceValidatorService.save(absenceValidatorDTO);
        return ResponseEntity.created(new URI("/api/absence-validators/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /absence-validators : Updates an existing absenceValidator.
     *
     * @param absenceValidatorDTO the absenceValidatorDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated absenceValidatorDTO,
     * or with status 400 (Bad Request) if the absenceValidatorDTO is not valid,
     * or with status 500 (Internal Server Error) if the absenceValidatorDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/absence-validators")
    public ResponseEntity<AbsenceValidatorDTO> updateAbsenceValidator(@Valid @RequestBody AbsenceValidatorDTO absenceValidatorDTO) throws URISyntaxException {
        log.debug("REST request to update AbsenceValidator : {}", absenceValidatorDTO);
        if (absenceValidatorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        AbsenceValidatorDTO result = absenceValidatorService.save(absenceValidatorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, absenceValidatorDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /absence-validators : get all the absenceValidators.
     *
     * @param pageable the pagination information
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many)
     * @return the ResponseEntity with status 200 (OK) and the list of absenceValidators in body
     */
    @GetMapping("/absence-validators")
    public ResponseEntity<List<AbsenceValidatorDTO>> getAllAbsenceValidators(Pageable pageable, @RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get a page of AbsenceValidators");
        Page<AbsenceValidatorDTO> page;
        if (eagerload) {
            page = absenceValidatorService.findAllWithEagerRelationships(pageable);
        } else {
            page = absenceValidatorService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, String.format("/api/absence-validators?eagerload=%b", eagerload));
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /absence-validators/:id : get the "id" absenceValidator.
     *
     * @param id the id of the absenceValidatorDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the absenceValidatorDTO, or with status 404 (Not Found)
     */
    @GetMapping("/absence-validators/{id}")
    public ResponseEntity<AbsenceValidatorDTO> getAbsenceValidator(@PathVariable Long id) {
        log.debug("REST request to get AbsenceValidator : {}", id);
        Optional<AbsenceValidatorDTO> absenceValidatorDTO = absenceValidatorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(absenceValidatorDTO);
    }

    /**
     * DELETE  /absence-validators/:id : delete the "id" absenceValidator.
     *
     * @param id the id of the absenceValidatorDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/absence-validators/{id}")
    public ResponseEntity<Void> deleteAbsenceValidator(@PathVariable Long id) {
        log.debug("REST request to delete AbsenceValidator : {}", id);
        absenceValidatorService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
