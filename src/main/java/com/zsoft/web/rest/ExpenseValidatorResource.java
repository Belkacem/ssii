package com.zsoft.web.rest;
import com.zsoft.service.ExpenseValidatorService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ExpenseValidatorDTO;
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
 * REST controller for managing ExpenseValidator.
 */
@RestController
@RequestMapping("/api")
public class ExpenseValidatorResource {

    private final Logger log = LoggerFactory.getLogger(ExpenseValidatorResource.class);

    private static final String ENTITY_NAME = "expenseValidator";

    private final ExpenseValidatorService expenseValidatorService;

    public ExpenseValidatorResource(ExpenseValidatorService expenseValidatorService) {
        this.expenseValidatorService = expenseValidatorService;
    }

    /**
     * POST  /expense-validators : Create a new expenseValidator.
     *
     * @param expenseValidatorDTO the expenseValidatorDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new expenseValidatorDTO, or with status 400 (Bad Request) if the expenseValidator has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/expense-validators")
    public ResponseEntity<ExpenseValidatorDTO> createExpenseValidator(@Valid @RequestBody ExpenseValidatorDTO expenseValidatorDTO) throws URISyntaxException {
        log.debug("REST request to save ExpenseValidator : {}", expenseValidatorDTO);
        if (expenseValidatorDTO.getId() != null) {
            throw new BadRequestAlertException("A new expenseValidator cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ExpenseValidatorDTO result = expenseValidatorService.save(expenseValidatorDTO);
        return ResponseEntity.created(new URI("/api/expense-validators/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /expense-validators : Updates an existing expenseValidator.
     *
     * @param expenseValidatorDTO the expenseValidatorDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated expenseValidatorDTO,
     * or with status 400 (Bad Request) if the expenseValidatorDTO is not valid,
     * or with status 500 (Internal Server Error) if the expenseValidatorDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/expense-validators")
    public ResponseEntity<ExpenseValidatorDTO> updateExpenseValidator(@Valid @RequestBody ExpenseValidatorDTO expenseValidatorDTO) throws URISyntaxException {
        log.debug("REST request to update ExpenseValidator : {}", expenseValidatorDTO);
        if (expenseValidatorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ExpenseValidatorDTO result = expenseValidatorService.save(expenseValidatorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, expenseValidatorDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /expense-validators : get all the expenseValidators.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of expenseValidators in body
     */
    @GetMapping("/expense-validators")
    public ResponseEntity<List<ExpenseValidatorDTO>> getAllExpenseValidators(Pageable pageable) {
        log.debug("REST request to get a page of ExpenseValidators");
        Page<ExpenseValidatorDTO> page = expenseValidatorService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/expense-validators");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /expense-validators/:id : get the "id" expenseValidator.
     *
     * @param id the id of the expenseValidatorDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the expenseValidatorDTO, or with status 404 (Not Found)
     */
    @GetMapping("/expense-validators/{id}")
    public ResponseEntity<ExpenseValidatorDTO> getExpenseValidator(@PathVariable Long id) {
        log.debug("REST request to get ExpenseValidator : {}", id);
        Optional<ExpenseValidatorDTO> expenseValidatorDTO = expenseValidatorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(expenseValidatorDTO);
    }

    /**
     * DELETE  /expense-validators/:id : delete the "id" expenseValidator.
     *
     * @param id the id of the expenseValidatorDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/expense-validators/{id}")
    public ResponseEntity<Void> deleteExpenseValidator(@PathVariable Long id) {
        log.debug("REST request to delete ExpenseValidator : {}", id);
        expenseValidatorService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
