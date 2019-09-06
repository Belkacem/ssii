package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ExpenseValidatorDTO;
import com.zsoft.service.extensions.ExpenseValidatorServiceExt;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
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
public class ExpenseValidatorResourceExt {

    private final Logger log = LoggerFactory.getLogger(ExpenseValidatorResourceExt.class);

    private static final String ENTITY_NAME = "expenseValidator";

    private final ExpenseValidatorServiceExt expenseValidatorServiceExt;

    public ExpenseValidatorResourceExt(ExpenseValidatorServiceExt expenseValidatorServiceExt) {
        this.expenseValidatorServiceExt = expenseValidatorServiceExt;
    }

    /**
     * POST  /expense-validators : Create a new expenseValidator.
     *
     * @param expenseValidatorDTO the expenseValidatorDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new expenseValidatorDTO, or with status 400 (Bad Request) if the expenseValidator has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(value = "/expense-validators", params = {"override"})
    public ResponseEntity<ExpenseValidatorDTO> createExpenseValidator(@Valid @RequestBody ExpenseValidatorDTO expenseValidatorDTO) throws URISyntaxException {
        log.debug("REST request to save ExpenseValidator : {}", expenseValidatorDTO);
        if (expenseValidatorDTO.getId() != null) {
            throw new BadRequestAlertException("A new expenseValidator cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ExpenseValidatorDTO result = expenseValidatorServiceExt.create(expenseValidatorDTO);
        return ResponseEntity.created(new URI("/api/expense-validators/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * GET  /expense-validators : get all the expenseValidators by Company.
     *
     * @param pageable  the pagination information
     * @param companyId the expense validator company
     * @return the ResponseEntity with status 200 (OK) and the list of expenseValidators in body
     */
    @GetMapping(value = "/expense-validators", params = {"override"})
    public ResponseEntity<List<ExpenseValidatorDTO>> getAllExpenseValidators(
        Pageable pageable,
        @RequestParam("company_id") Long companyId
    ) {
        log.debug("REST request to get a page of ExpenseValidators by company: {}", companyId);
        Page<ExpenseValidatorDTO> page = expenseValidatorServiceExt.findAll(pageable, companyId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/expense-validators");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /expense-validators/current/:company_id : get the current expense Validator by company.
     *
     * @param companyId the company id of expense Validator to get
     * @return the ResponseEntity with status 200 (OK) and with body the expenseValidatorDTO, or with status 404 (Not Found)
     */
    @GetMapping("/expense-validators/current/{company_id}")
    public ResponseEntity<ExpenseValidatorDTO> getExpenseValidator(@PathVariable("company_id") Long companyId) {
        log.debug("REST request to get the current ExpenseValidator in company: {}", companyId);
        Optional<ExpenseValidatorDTO> expenseValidatorDTO = expenseValidatorServiceExt.getCurrentByCompany(companyId);
        return ResponseEntity.ok().body(expenseValidatorDTO.orElse(null));
    }

    /**
     * PUT  /expense-validators?ticket : Updates an existing expenseValidator by ticket.
     *
     * @param ticket the ticket of expenseValidator to update
     * @return the ResponseEntity with status 200 (OK)
     */
    @PutMapping(value = "/expense-validators", params = {"ticket"})
    public ResponseEntity updateExpenseValidator(@Valid @RequestParam String ticket) {
        log.debug("REST request to assign a Expense Validator to an user account by ticket : {}", ticket);
        try {
            expenseValidatorServiceExt.assignToAccount(ticket);
        } catch (Exception cve) {
            throw new BadRequestAlertException("You already connected as expense validator", ENTITY_NAME, "isunique");
        }
        return ResponseEntity.ok(200);
    }

    /**
     * GET /expense-validators/new-tickets : Check for new expenseValidator ticket.
     *
     * @return the ResponseEntity with status 200 (OK) and with body the expenseValidatorDTO or null
     */
    @GetMapping(value = "/expense-validators/new-tickets")
    public ResponseEntity checkNewTickets() {
        log.debug("REST request to check for new Expense Validator ticket");
        Optional<ExpenseValidatorDTO> expenseValidatorDTO = expenseValidatorServiceExt.checkNewTickets();
        return ResponseEntity.ok().body(expenseValidatorDTO.orElse(null));
    }

    /**
     * GET  /expense-validators/resend-ticket/:expense_validator_id : resend a new invitation with ticket to Expense Validator.
     *
     * @param expenseValidatorId the id of Expense Validator
     * @return the ResponseEntity with status 200 (OK) and with body ExpenseValidatorDTO
     */
    @GetMapping("/expense-validators/resend-ticket/{expense_validator_id}")
    public ResponseEntity<ExpenseValidatorDTO> resetTicket(@PathVariable("expense_validator_id") Long expenseValidatorId) {
        log.debug("REST request to resend a Expense Validator invitation : {}", expenseValidatorId);
        ExpenseValidatorDTO result = expenseValidatorServiceExt.resendTicket(expenseValidatorId);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, expenseValidatorId.toString()))
            .body(result);
    }
}
