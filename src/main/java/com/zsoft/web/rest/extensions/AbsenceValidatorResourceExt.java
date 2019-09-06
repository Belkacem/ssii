package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.AbsenceValidatorDTO;
import com.zsoft.service.extensions.AbsenceValidatorServiceExt;
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
 * REST controller for managing AbsenceValidator.
 */
@RestController
@RequestMapping("/api")
public class AbsenceValidatorResourceExt {

    private final Logger log = LoggerFactory.getLogger(AbsenceValidatorResourceExt.class);

    private static final String ENTITY_NAME = "absenceValidator";

    private final AbsenceValidatorServiceExt absenceValidatorServiceExt;

    public AbsenceValidatorResourceExt(AbsenceValidatorServiceExt absenceValidatorServiceExt) {
        this.absenceValidatorServiceExt = absenceValidatorServiceExt;
    }

    /**
     * POST  /absence-validators : Create a new absenceValidator.
     *
     * @param absenceValidatorDTO the absenceValidatorDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new absenceValidatorDTO, or with status 400 (Bad Request) if the absenceValidator has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(value = "/absence-validators", params = {"override"})
    public ResponseEntity<AbsenceValidatorDTO> createAbsenceValidator(@Valid @RequestBody AbsenceValidatorDTO absenceValidatorDTO) throws URISyntaxException {
        log.debug("REST request to save AbsenceValidator : {}", absenceValidatorDTO);
        if (absenceValidatorDTO.getId() != null) {
            throw new BadRequestAlertException("A new absenceValidator cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AbsenceValidatorDTO result = absenceValidatorServiceExt.create(absenceValidatorDTO);
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
     */
    @PutMapping(value = "/absence-validators", params = {"override"})
    public ResponseEntity<AbsenceValidatorDTO> updateAbsenceValidator(@Valid @RequestBody AbsenceValidatorDTO absenceValidatorDTO) {
        log.debug("REST request to update AbsenceValidator : {}", absenceValidatorDTO);
        if (absenceValidatorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        AbsenceValidatorDTO result = absenceValidatorServiceExt.update(absenceValidatorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, absenceValidatorDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /absence-validators : get all the absenceValidators.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of absenceValidators in body
     */
    @GetMapping(value = "/absence-validators", params = {"override"})
    public ResponseEntity<List<AbsenceValidatorDTO>> getAllAbsenceValidators(Pageable pageable) {
        log.debug("REST request to get AbsenceValidators : {}");
        Page<AbsenceValidatorDTO> page = absenceValidatorServiceExt.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absence-validators");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /absence-validators/current/:company_id : get the current absence Validator by company.
     *
     * @param companyId the company id of absence Validator to get
     * @return the ResponseEntity with status 200 (OK) and with body the list of current absence validators in body
     */
    @GetMapping("/absence-validators/current/{company_id}")
    public ResponseEntity<AbsenceValidatorDTO> getCurrentAbsenceValidator(@PathVariable("company_id") Long companyId) {
        log.debug("REST request to get Current absence validator in company : {}", companyId);
        Optional<AbsenceValidatorDTO> absenceValidatorDTO = absenceValidatorServiceExt.getCurrentByCompany(companyId);
        return ResponseEntity.ok().body(absenceValidatorDTO.orElse(null));
    }

    /**
     * PUT  /absence-validators?ticket : Updates an existing absenceValidator.
     *
     * @param ticket the ticket of absenceValidatorDTO to update
     * @return the ResponseEntity with status 200 (OK)
     */
    @PutMapping(value = "/absence-validators", params = {"ticket"})
    public ResponseEntity assignAccount(@Valid @RequestParam String ticket) {
        log.debug("REST request to assign a Absence Validator to an user account by ticket : {}", ticket);
        try {
            absenceValidatorServiceExt.assignToAccount(ticket);
        } catch (Exception cve) {
            throw new BadRequestAlertException("You already connected as absence validator", ENTITY_NAME, "isunique");
        }
        return ResponseEntity.ok(200);
    }

    /**
     * GET /absence-validators/new-tickets : Check for new absenceValidator ticket.
     *
     * @return the ResponseEntity with status 200 (OK) and with body the absenceValidatorDTO or null
     */
    @GetMapping(value = "/absence-validators/new-tickets")
    public ResponseEntity checkNewTickets() {
        log.debug("REST request to check for new Absence Validator ticket");
        Optional<AbsenceValidatorDTO> absenceValidatorDTO = absenceValidatorServiceExt.checkNewTickets();
        return ResponseEntity.ok().body(absenceValidatorDTO.orElse(null));
    }

    /**
     * GET  /absence-validators/resend-ticket/:absence_validator_id : resend a new invitation with ticket to Absence Validator.
     *
     * @param absenceValidatorId the id of Absence Validator
     * @return the ResponseEntity with status 200 (OK) and with body AbsenceValidatorDTO
     */
    @GetMapping("/absence-validators/resend-ticket/{absence_validator_id}")
    public ResponseEntity<AbsenceValidatorDTO> resetTicket(@PathVariable("absence_validator_id") Long absenceValidatorId) {
        log.debug("REST request to resend a Absence Validator invitation : {}", absenceValidatorId);
        AbsenceValidatorDTO result = absenceValidatorServiceExt.resendTicket(absenceValidatorId);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, absenceValidatorId.toString()))
            .body(result);
    }
}
