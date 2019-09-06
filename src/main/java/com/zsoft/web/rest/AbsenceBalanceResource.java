package com.zsoft.web.rest;
import com.zsoft.service.AbsenceBalanceService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.AbsenceBalanceDTO;
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
 * REST controller for managing AbsenceBalance.
 */
@RestController
@RequestMapping("/api")
public class AbsenceBalanceResource {

    private final Logger log = LoggerFactory.getLogger(AbsenceBalanceResource.class);

    private static final String ENTITY_NAME = "absenceBalance";

    private final AbsenceBalanceService absenceBalanceService;

    public AbsenceBalanceResource(AbsenceBalanceService absenceBalanceService) {
        this.absenceBalanceService = absenceBalanceService;
    }

    /**
     * POST  /absence-balances : Create a new absenceBalance.
     *
     * @param absenceBalanceDTO the absenceBalanceDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new absenceBalanceDTO, or with status 400 (Bad Request) if the absenceBalance has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/absence-balances")
    public ResponseEntity<AbsenceBalanceDTO> createAbsenceBalance(@Valid @RequestBody AbsenceBalanceDTO absenceBalanceDTO) throws URISyntaxException {
        log.debug("REST request to save AbsenceBalance : {}", absenceBalanceDTO);
        if (absenceBalanceDTO.getId() != null) {
            throw new BadRequestAlertException("A new absenceBalance cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AbsenceBalanceDTO result = absenceBalanceService.save(absenceBalanceDTO);
        return ResponseEntity.created(new URI("/api/absence-balances/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /absence-balances : Updates an existing absenceBalance.
     *
     * @param absenceBalanceDTO the absenceBalanceDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated absenceBalanceDTO,
     * or with status 400 (Bad Request) if the absenceBalanceDTO is not valid,
     * or with status 500 (Internal Server Error) if the absenceBalanceDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/absence-balances")
    public ResponseEntity<AbsenceBalanceDTO> updateAbsenceBalance(@Valid @RequestBody AbsenceBalanceDTO absenceBalanceDTO) throws URISyntaxException {
        log.debug("REST request to update AbsenceBalance : {}", absenceBalanceDTO);
        if (absenceBalanceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        AbsenceBalanceDTO result = absenceBalanceService.save(absenceBalanceDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, absenceBalanceDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /absence-balances : get all the absenceBalances.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of absenceBalances in body
     */
    @GetMapping("/absence-balances")
    public ResponseEntity<List<AbsenceBalanceDTO>> getAllAbsenceBalances(Pageable pageable) {
        log.debug("REST request to get a page of AbsenceBalances");
        Page<AbsenceBalanceDTO> page = absenceBalanceService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absence-balances");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /absence-balances/:id : get the "id" absenceBalance.
     *
     * @param id the id of the absenceBalanceDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the absenceBalanceDTO, or with status 404 (Not Found)
     */
    @GetMapping("/absence-balances/{id}")
    public ResponseEntity<AbsenceBalanceDTO> getAbsenceBalance(@PathVariable Long id) {
        log.debug("REST request to get AbsenceBalance : {}", id);
        Optional<AbsenceBalanceDTO> absenceBalanceDTO = absenceBalanceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(absenceBalanceDTO);
    }

    /**
     * DELETE  /absence-balances/:id : delete the "id" absenceBalance.
     *
     * @param id the id of the absenceBalanceDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/absence-balances/{id}")
    public ResponseEntity<Void> deleteAbsenceBalance(@PathVariable Long id) {
        log.debug("REST request to delete AbsenceBalance : {}", id);
        absenceBalanceService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
