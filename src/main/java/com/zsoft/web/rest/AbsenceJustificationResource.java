package com.zsoft.web.rest;
import com.zsoft.service.AbsenceJustificationService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.AbsenceJustificationDTO;
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
 * REST controller for managing AbsenceJustification.
 */
@RestController
@RequestMapping("/api")
public class AbsenceJustificationResource {

    private final Logger log = LoggerFactory.getLogger(AbsenceJustificationResource.class);

    private static final String ENTITY_NAME = "absenceJustification";

    private final AbsenceJustificationService absenceJustificationService;

    public AbsenceJustificationResource(AbsenceJustificationService absenceJustificationService) {
        this.absenceJustificationService = absenceJustificationService;
    }

    /**
     * POST  /absence-justifications : Create a new absenceJustification.
     *
     * @param absenceJustificationDTO the absenceJustificationDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new absenceJustificationDTO, or with status 400 (Bad Request) if the absenceJustification has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/absence-justifications")
    public ResponseEntity<AbsenceJustificationDTO> createAbsenceJustification(@Valid @RequestBody AbsenceJustificationDTO absenceJustificationDTO) throws URISyntaxException {
        log.debug("REST request to save AbsenceJustification : {}", absenceJustificationDTO);
        if (absenceJustificationDTO.getId() != null) {
            throw new BadRequestAlertException("A new absenceJustification cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AbsenceJustificationDTO result = absenceJustificationService.save(absenceJustificationDTO);
        return ResponseEntity.created(new URI("/api/absence-justifications/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /absence-justifications : Updates an existing absenceJustification.
     *
     * @param absenceJustificationDTO the absenceJustificationDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated absenceJustificationDTO,
     * or with status 400 (Bad Request) if the absenceJustificationDTO is not valid,
     * or with status 500 (Internal Server Error) if the absenceJustificationDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/absence-justifications")
    public ResponseEntity<AbsenceJustificationDTO> updateAbsenceJustification(@Valid @RequestBody AbsenceJustificationDTO absenceJustificationDTO) throws URISyntaxException {
        log.debug("REST request to update AbsenceJustification : {}", absenceJustificationDTO);
        if (absenceJustificationDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        AbsenceJustificationDTO result = absenceJustificationService.save(absenceJustificationDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, absenceJustificationDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /absence-justifications : get all the absenceJustifications.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of absenceJustifications in body
     */
    @GetMapping("/absence-justifications")
    public ResponseEntity<List<AbsenceJustificationDTO>> getAllAbsenceJustifications(Pageable pageable) {
        log.debug("REST request to get a page of AbsenceJustifications");
        Page<AbsenceJustificationDTO> page = absenceJustificationService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absence-justifications");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /absence-justifications/:id : get the "id" absenceJustification.
     *
     * @param id the id of the absenceJustificationDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the absenceJustificationDTO, or with status 404 (Not Found)
     */
    @GetMapping("/absence-justifications/{id}")
    public ResponseEntity<AbsenceJustificationDTO> getAbsenceJustification(@PathVariable Long id) {
        log.debug("REST request to get AbsenceJustification : {}", id);
        Optional<AbsenceJustificationDTO> absenceJustificationDTO = absenceJustificationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(absenceJustificationDTO);
    }

    /**
     * DELETE  /absence-justifications/:id : delete the "id" absenceJustification.
     *
     * @param id the id of the absenceJustificationDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/absence-justifications/{id}")
    public ResponseEntity<Void> deleteAbsenceJustification(@PathVariable Long id) {
        log.debug("REST request to delete AbsenceJustification : {}", id);
        absenceJustificationService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
