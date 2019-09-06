package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ExpenseDTO;
import com.zsoft.service.extensions.ExpenseServiceExt;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Expense.
 */
@RestController
@RequestMapping("/api")
public class ExpenseResourceExt {

    private final Logger log = LoggerFactory.getLogger(ExpenseResourceExt.class);

    private static final String ENTITY_NAME = "expense";

    private final ExpenseServiceExt expenseServiceExt;

    public ExpenseResourceExt(ExpenseServiceExt expenseServiceExt) {
        this.expenseServiceExt = expenseServiceExt;
    }

    /**
     * POST  /expenses : Create a new expense.
     *
     * @param expenseDTO the expenseDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new expenseDTO, or with status 400 (Bad Request) if the expense has already an ID
     */
    @PostMapping(value = "/expenses", params = {"override"})
    public ResponseEntity<ExpenseDTO> createExpense(@Valid @RequestBody ExpenseDTO expenseDTO) {
        log.debug("REST request to create a new Expense : {}", expenseDTO);
        if (expenseDTO.getId() != null) {
            throw new BadRequestAlertException("A new expense cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Optional<ExpenseDTO> result = expenseServiceExt.create(expenseDTO);
        return ResponseUtil.wrapOrNotFound(result);
    }

    /**
     * PUT  /expenses : Updates an existing expense.
     *
     * @param expenseDTO the expenseDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated expenseDTO,
     * or with status 400 (Bad Request) if the expenseDTO is not valid,
     * or with status 500 (Internal Server Error) if the expenseDTO couldn't be updated
     */
    @PutMapping(value = "/expenses", params = {"override"})
    public ResponseEntity<ExpenseDTO> updateExpense(@Valid @RequestBody ExpenseDTO expenseDTO) {
        log.debug("REST request to update Expense : {}", expenseDTO);
        if (expenseDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ExpenseDTO oldAbsence = expenseServiceExt.findOne(expenseDTO.getId())
            .orElseThrow(() -> new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull"));
        Optional<ExpenseDTO> result = expenseServiceExt.update(expenseDTO);
        result.ifPresent(newExpenseDTO -> {
            if (oldAbsence.getSubmissionDate() == null && newExpenseDTO.getSubmissionDate() != null) {
                expenseServiceExt.sendSubmissionNotification(newExpenseDTO);
            }
            if (oldAbsence.getValidatorId() == null && newExpenseDTO.getValidatorId() != null) {
                expenseServiceExt.sendValidationNotification(newExpenseDTO);
            }
        });
        return ResponseUtil.wrapOrNotFound(result);
    }

    /**
     * DELETE  /expenses/:id : delete the "id" expense.
     *
     * @param id the id of the expenseDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping(value = "/expenses/{id}", params = {"override"})
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        log.debug("REST request to delete Expense : {}", id);
        Optional<ExpenseDTO> expenseDTO = expenseServiceExt.findOne(id);
        if (!expenseDTO.isPresent()) {
            throw new BadRequestAlertException("Can't delete expense not exist", ENTITY_NAME, "notfound");
        } else {
            if (expenseDTO.get().getSubmissionDate() != null) {
                throw new BadRequestAlertException("Can't delete expense already submitted", ENTITY_NAME, "alreadysubmitted");
            }
        }
        expenseServiceExt.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * GET  /expenses : get all the expenses by Resource.
     *
     * @param pageable   the pagination information
     * @param resourceIds the list of expense resource ids
     * @param validatorIdSpecified is the validatorId is specified
     * @return the ResponseEntity with status 200 (OK) and the list of expenses in body
     */
    @GetMapping(value = "/expenses", params = {"override", "resourceIds", "validatorIdSpecified"})
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses(
        Pageable pageable,
        @RequestParam("resourceIds") List<Long> resourceIds,
        @RequestParam("validatorIdSpecified") Boolean validatorIdSpecified
    ) {
        log.debug("REST request to get a page of Expenses by resources: {} and Validator is Specified: {}", resourceIds, validatorIdSpecified);
        Page<ExpenseDTO> page = expenseServiceExt.findAll(pageable, resourceIds, validatorIdSpecified);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/expenses");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /expenses : get all the expenses by Resource.
     *
     * @param pageable   the pagination information
     * @param companyId the id of expense resource company
     * @param validatorIdSpecified is the validatorId is specified
     * @return the ResponseEntity with status 200 (OK) and the list of expenses in body
     */
    @GetMapping(value = "/expenses", params = {"override", "companyId", "validatorIdSpecified"})
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses(
        Pageable pageable,
        @RequestParam("companyId") Long companyId,
        @RequestParam("validatorIdSpecified") Boolean validatorIdSpecified
    ) {
        log.debug("REST request to get a page of Expenses by company: {} and Validator is Specified: {}", companyId, validatorIdSpecified);
        Page<ExpenseDTO> page = expenseServiceExt.findAll(pageable, companyId, validatorIdSpecified);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/expenses");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /expenses : get all the expenses by Resource.
     *
     * @param pageable   the pagination information
     * @param companyId the id of expense resource company
     * @param validatorId is the id of validator
     * @return the ResponseEntity with status 200 (OK) and the list of expenses in body
     */
    @GetMapping(value = "/expenses", params = {"override", "companyId", "validatorId"})
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses(
        Pageable pageable,
        @RequestParam("companyId") Long companyId,
        @RequestParam("validatorId") Long validatorId
    ) {
        log.debug("REST request to get a page of Expenses by company: {} and Validator: {}", companyId, validatorId);
        Page<ExpenseDTO> page = expenseServiceExt.findAll(pageable, companyId, validatorId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/expenses");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
