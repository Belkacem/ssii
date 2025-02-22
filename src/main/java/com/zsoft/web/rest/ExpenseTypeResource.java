package com.zsoft.web.rest;
import com.zsoft.service.ExpenseTypeService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ExpenseTypeDTO;
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
 * REST controller for managing ExpenseType.
 */
@RestController
@RequestMapping("/api")
public class ExpenseTypeResource {

    private final Logger log = LoggerFactory.getLogger(ExpenseTypeResource.class);

    private static final String ENTITY_NAME = "expenseType";

    private final ExpenseTypeService expenseTypeService;

    public ExpenseTypeResource(ExpenseTypeService expenseTypeService) {
        this.expenseTypeService = expenseTypeService;
    }

    /**
     * POST  /expense-types : Create a new expenseType.
     *
     * @param expenseTypeDTO the expenseTypeDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new expenseTypeDTO, or with status 400 (Bad Request) if the expenseType has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/expense-types")
    public ResponseEntity<ExpenseTypeDTO> createExpenseType(@Valid @RequestBody ExpenseTypeDTO expenseTypeDTO) throws URISyntaxException {
        log.debug("REST request to save ExpenseType : {}", expenseTypeDTO);
        if (expenseTypeDTO.getId() != null) {
            throw new BadRequestAlertException("A new expenseType cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ExpenseTypeDTO result = expenseTypeService.save(expenseTypeDTO);
        return ResponseEntity.created(new URI("/api/expense-types/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /expense-types : Updates an existing expenseType.
     *
     * @param expenseTypeDTO the expenseTypeDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated expenseTypeDTO,
     * or with status 400 (Bad Request) if the expenseTypeDTO is not valid,
     * or with status 500 (Internal Server Error) if the expenseTypeDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/expense-types")
    public ResponseEntity<ExpenseTypeDTO> updateExpenseType(@Valid @RequestBody ExpenseTypeDTO expenseTypeDTO) throws URISyntaxException {
        log.debug("REST request to update ExpenseType : {}", expenseTypeDTO);
        if (expenseTypeDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ExpenseTypeDTO result = expenseTypeService.save(expenseTypeDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, expenseTypeDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /expense-types : get all the expenseTypes.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of expenseTypes in body
     */
    @GetMapping("/expense-types")
    public ResponseEntity<List<ExpenseTypeDTO>> getAllExpenseTypes(Pageable pageable) {
        log.debug("REST request to get a page of ExpenseTypes");
        Page<ExpenseTypeDTO> page = expenseTypeService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/expense-types");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /expense-types/:id : get the "id" expenseType.
     *
     * @param id the id of the expenseTypeDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the expenseTypeDTO, or with status 404 (Not Found)
     */
    @GetMapping("/expense-types/{id}")
    public ResponseEntity<ExpenseTypeDTO> getExpenseType(@PathVariable Long id) {
        log.debug("REST request to get ExpenseType : {}", id);
        Optional<ExpenseTypeDTO> expenseTypeDTO = expenseTypeService.findOne(id);
        return ResponseUtil.wrapOrNotFound(expenseTypeDTO);
    }

    /**
     * DELETE  /expense-types/:id : delete the "id" expenseType.
     *
     * @param id the id of the expenseTypeDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/expense-types/{id}")
    public ResponseEntity<Void> deleteExpenseType(@PathVariable Long id) {
        log.debug("REST request to delete ExpenseType : {}", id);
        expenseTypeService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
