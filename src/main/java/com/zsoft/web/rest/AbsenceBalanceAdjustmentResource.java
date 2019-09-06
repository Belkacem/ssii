package com.zsoft.web.rest;
import com.zsoft.service.AbsenceBalanceAdjustmentService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.AbsenceBalanceAdjustmentDTO;
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
 * REST controller for managing AbsenceBalanceAdjustment.
 */
@RestController
@RequestMapping("/api")
public class AbsenceBalanceAdjustmentResource {

    private final Logger log = LoggerFactory.getLogger(AbsenceBalanceAdjustmentResource.class);

    private static final String ENTITY_NAME = "absenceBalanceAdjustment";

    private final AbsenceBalanceAdjustmentService absenceBalanceAdjustmentService;

    public AbsenceBalanceAdjustmentResource(AbsenceBalanceAdjustmentService absenceBalanceAdjustmentService) {
        this.absenceBalanceAdjustmentService = absenceBalanceAdjustmentService;
    }

    /**
     * POST  /absence-balance-adjustments : Create a new absenceBalanceAdjustment.
     *
     * @param absenceBalanceAdjustmentDTO the absenceBalanceAdjustmentDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new absenceBalanceAdjustmentDTO, or with status 400 (Bad Request) if the absenceBalanceAdjustment has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/absence-balance-adjustments")
    public ResponseEntity<AbsenceBalanceAdjustmentDTO> createAbsenceBalanceAdjustment(@Valid @RequestBody AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO) throws URISyntaxException {
        log.debug("REST request to save AbsenceBalanceAdjustment : {}", absenceBalanceAdjustmentDTO);
        if (absenceBalanceAdjustmentDTO.getId() != null) {
            throw new BadRequestAlertException("A new absenceBalanceAdjustment cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AbsenceBalanceAdjustmentDTO result = absenceBalanceAdjustmentService.save(absenceBalanceAdjustmentDTO);
        return ResponseEntity.created(new URI("/api/absence-balance-adjustments/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /absence-balance-adjustments : Updates an existing absenceBalanceAdjustment.
     *
     * @param absenceBalanceAdjustmentDTO the absenceBalanceAdjustmentDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated absenceBalanceAdjustmentDTO,
     * or with status 400 (Bad Request) if the absenceBalanceAdjustmentDTO is not valid,
     * or with status 500 (Internal Server Error) if the absenceBalanceAdjustmentDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/absence-balance-adjustments")
    public ResponseEntity<AbsenceBalanceAdjustmentDTO> updateAbsenceBalanceAdjustment(@Valid @RequestBody AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO) throws URISyntaxException {
        log.debug("REST request to update AbsenceBalanceAdjustment : {}", absenceBalanceAdjustmentDTO);
        if (absenceBalanceAdjustmentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        AbsenceBalanceAdjustmentDTO result = absenceBalanceAdjustmentService.save(absenceBalanceAdjustmentDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, absenceBalanceAdjustmentDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /absence-balance-adjustments : get all the absenceBalanceAdjustments.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of absenceBalanceAdjustments in body
     */
    @GetMapping("/absence-balance-adjustments")
    public ResponseEntity<List<AbsenceBalanceAdjustmentDTO>> getAllAbsenceBalanceAdjustments(Pageable pageable) {
        log.debug("REST request to get a page of AbsenceBalanceAdjustments");
        Page<AbsenceBalanceAdjustmentDTO> page = absenceBalanceAdjustmentService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absence-balance-adjustments");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /absence-balance-adjustments/:id : get the "id" absenceBalanceAdjustment.
     *
     * @param id the id of the absenceBalanceAdjustmentDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the absenceBalanceAdjustmentDTO, or with status 404 (Not Found)
     */
    @GetMapping("/absence-balance-adjustments/{id}")
    public ResponseEntity<AbsenceBalanceAdjustmentDTO> getAbsenceBalanceAdjustment(@PathVariable Long id) {
        log.debug("REST request to get AbsenceBalanceAdjustment : {}", id);
        Optional<AbsenceBalanceAdjustmentDTO> absenceBalanceAdjustmentDTO = absenceBalanceAdjustmentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(absenceBalanceAdjustmentDTO);
    }

    /**
     * DELETE  /absence-balance-adjustments/:id : delete the "id" absenceBalanceAdjustment.
     *
     * @param id the id of the absenceBalanceAdjustmentDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/absence-balance-adjustments/{id}")
    public ResponseEntity<Void> deleteAbsenceBalanceAdjustment(@PathVariable Long id) {
        log.debug("REST request to delete AbsenceBalanceAdjustment : {}", id);
        absenceBalanceAdjustmentService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
