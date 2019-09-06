package com.zsoft.web.rest.extensions;

import com.zsoft.service.extensions.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing Tickets.
 */
@RestController
@RequestMapping("/api")
public class TicketResource {
    private final Logger log = LoggerFactory.getLogger(TicketResource.class);

    private final AbsenceValidatorServiceExt absenceValidatorServiceExt;
    private final ProjectValidatorServiceExt projectValidatorServiceExt;
    private final ResourceServiceExt resourceServiceExt;
    private final ExpenseValidatorServiceExt expenseValidatorServiceExt;
    private final ProjectContractorServiceExt projectContractorServiceExt;

    public TicketResource(
        AbsenceValidatorServiceExt absenceValidatorServiceExt,
        ProjectValidatorServiceExt projectValidatorServiceExt,
        ResourceServiceExt resourceServiceExt,
        ExpenseValidatorServiceExt expenseValidatorServiceExt,
        ProjectContractorServiceExt projectContractorServiceExt
    ) {
        this.absenceValidatorServiceExt = absenceValidatorServiceExt;
        this.projectValidatorServiceExt = projectValidatorServiceExt;
        this.resourceServiceExt = resourceServiceExt;
        this.expenseValidatorServiceExt = expenseValidatorServiceExt;
        this.projectContractorServiceExt = projectContractorServiceExt;
    }

    /**
     * GET  /ticket/:ticket/absence-validators : get the absenceValidator email by ticket.
     *
     * @param ticket the ticket of the absenceValidatorDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the absence Validator email, or with status 404 (Not Found)
     */
    @GetMapping(value = "/ticket/{ticket}/absence-validators")
    public ResponseEntity<String> getAbsenceValidatorByTicket(@PathVariable String ticket) {
        log.debug("REST request to get Absence Validator by ticket : {}", ticket);
        return this.absenceValidatorServiceExt
            .findOneByTicket(ticket)
            .map(absenceValidatorDTO -> ResponseEntity.ok(absenceValidatorDTO.getEmail()))
            .orElse(ResponseEntity.badRequest().body("Ticket Not found"));
    }

    /**
     * GET  /ticket/:ticket/project-validators : get the projectValidator email by ticket.
     *
     * @param ticket the ticket of the projectValidatorDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the project Validator email, or with status 404 (Not Found)
     */
    @GetMapping(value = "/ticket/{ticket}/project-validators")
    public ResponseEntity<String> getProjectValidatorByTicket(@PathVariable String ticket) {
        log.debug("REST request to get ProjectValidator by ticket : {}", ticket);
        return this.projectValidatorServiceExt
            .findOneByTicket(ticket)
            .map(projectValidatorDTO -> ResponseEntity.ok(projectValidatorDTO.getEmail()))
            .orElse(ResponseEntity.badRequest().body("Ticket Not found"));
    }

    /**
     * GET  /ticket/:ticket/resources : get the resource email by ticket.
     *
     * @param ticket the ticket of the resourceDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the resource email, or with status 404 (Not Found)
     */
    @GetMapping(value = "/ticket/{ticket}/resources")
    public ResponseEntity<String> getResourceByTicket(@PathVariable String ticket) {
        log.debug("REST request to get Resource by ticket : {}", ticket);
        return this.resourceServiceExt
            .findOneByTicket(ticket)
            .map(resource -> ResponseEntity.ok(resource.getEmail()))
            .orElse(ResponseEntity.badRequest().body("Ticket Not found"));
    }

    /**
     * GET  /ticket/:ticket/expense-validators : get the expenseValidator email by ticket.
     *
     * @param ticket the ticket of the expenseValidatorDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the expense Validator email, or with status 404 (Not Found)
     */
    @GetMapping(value = "/ticket/{ticket}/expense-validators")
    public ResponseEntity<String> getExpenseValidatorByTicket(@PathVariable String ticket) {
        log.debug("REST request to get Expense Validator by ticket : {}", ticket);
        return this.expenseValidatorServiceExt
            .findOneByTicket(ticket)
            .map(expenseValidatorDTO -> ResponseEntity.ok(expenseValidatorDTO.getEmail()))
            .orElse(ResponseEntity.badRequest().body("Ticket Not found"));
    }

    /**
     * GET  /ticket/:ticket/project-contractors : get the projectContractor email by ticket.
     *
     * @param ticket the ticket of the projectContractorDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the project Contractor email, or with status 404 (Not Found)
     */
    @GetMapping(value = "/ticket/{ticket}/project-contractors")
    public ResponseEntity<String> getProjectContractorByTicket(@PathVariable String ticket) {
        log.debug("REST request to get Project Contractor by ticket : {}", ticket);
        return this.projectContractorServiceExt
            .findOneByTicket(ticket)
            .map(projectContractorDTO -> ResponseEntity.ok(projectContractorDTO.getEmail()))
            .orElse(ResponseEntity.badRequest().body("Ticket Not found"));
    }
}
