package com.zsoft.web.rest;
import com.zsoft.service.ExpenseJustificationService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ExpenseJustificationDTO;
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
 * REST controller for managing ExpenseJustification.
 */
@RestController
@RequestMapping("/api")
public class ExpenseJustificationResource {

    private final Logger log = LoggerFactory.getLogger(ExpenseJustificationResource.class);

    private static final String ENTITY_NAME = "expenseJustification";

    private final ExpenseJustificationService expenseJustificationService;

    public ExpenseJustificationResource(ExpenseJustificationService expenseJustificationService) {
        this.expenseJustificationService = expenseJustificationService;
    }

    /**
     * POST  /expense-justifications : Create a new expenseJustification.
     *
     * @param expenseJustificationDTO the expenseJustificationDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new expenseJustificationDTO, or with status 400 (Bad Request) if the expenseJustification has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/expense-justifications")
    public ResponseEntity<ExpenseJustificationDTO> createExpenseJustification(@Valid @RequestBody ExpenseJustificationDTO expenseJustificationDTO) throws URISyntaxException {
        log.debug("REST request to save ExpenseJustification : {}", expenseJustificationDTO);
        if (expenseJustificationDTO.getId() != null) {
            throw new BadRequestAlertException("A new expenseJustification cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ExpenseJustificationDTO result = expenseJustificationService.save(expenseJustificationDTO);
        return ResponseEntity.created(new URI("/api/expense-justifications/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /expense-justifications : Updates an existing expenseJustification.
     *
     * @param expenseJustificationDTO the expenseJustificationDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated expenseJustificationDTO,
     * or with status 400 (Bad Request) if the expenseJustificationDTO is not valid,
     * or with status 500 (Internal Server Error) if the expenseJustificationDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/expense-justifications")
    public ResponseEntity<ExpenseJustificationDTO> updateExpenseJustification(@Valid @RequestBody ExpenseJustificationDTO expenseJustificationDTO) throws URISyntaxException {
        log.debug("REST request to update ExpenseJustification : {}", expenseJustificationDTO);
        if (expenseJustificationDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ExpenseJustificationDTO result = expenseJustificationService.save(expenseJustificationDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, expenseJustificationDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /expense-justifications : get all the expenseJustifications.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of expenseJustifications in body
     */
    @GetMapping("/expense-justifications")
    public ResponseEntity<List<ExpenseJustificationDTO>> getAllExpenseJustifications(Pageable pageable) {
        log.debug("REST request to get a page of ExpenseJustifications");
        Page<ExpenseJustificationDTO> page = expenseJustificationService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/expense-justifications");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /expense-justifications/:id : get the "id" expenseJustification.
     *
     * @param id the id of the expenseJustificationDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the expenseJustificationDTO, or with status 404 (Not Found)
     */
    @GetMapping("/expense-justifications/{id}")
    public ResponseEntity<ExpenseJustificationDTO> getExpenseJustification(@PathVariable Long id) {
        log.debug("REST request to get ExpenseJustification : {}", id);
        Optional<ExpenseJustificationDTO> expenseJustificationDTO = expenseJustificationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(expenseJustificationDTO);
    }

    /**
     * DELETE  /expense-justifications/:id : delete the "id" expenseJustification.
     *
     * @param id the id of the expenseJustificationDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/expense-justifications/{id}")
    public ResponseEntity<Void> deleteExpenseJustification(@PathVariable Long id) {
        log.debug("REST request to delete ExpenseJustification : {}", id);
        expenseJustificationService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
