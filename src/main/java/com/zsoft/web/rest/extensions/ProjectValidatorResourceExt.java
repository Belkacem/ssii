package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ProjectValidatorDTO;
import com.zsoft.service.extensions.ProjectValidatorServiceExt;
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
 * REST controller for managing ProjectValidator.
 */
@RestController
@RequestMapping("/api")
public class ProjectValidatorResourceExt {

    private final Logger log = LoggerFactory.getLogger(ProjectValidatorResourceExt.class);

    private static final String ENTITY_NAME = "projectValidator";

    private final ProjectValidatorServiceExt projectValidatorServiceExt;

    public ProjectValidatorResourceExt(ProjectValidatorServiceExt projectValidatorServiceExt) {
        this.projectValidatorServiceExt = projectValidatorServiceExt;
    }

    /**
     * POST  /project-validators : Create a new projectValidator.
     *
     * @param projectValidatorDTO the projectValidatorDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new projectValidatorDTO, or with status 400 (Bad Request) if the projectValidator has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(value = "/project-validators", params = {"override"})
    public ResponseEntity<ProjectValidatorDTO> createProjectValidator(@Valid @RequestBody ProjectValidatorDTO projectValidatorDTO) throws URISyntaxException {
        log.debug("REST request to save ProjectValidator : {}", projectValidatorDTO);
        if (projectValidatorDTO.getId() != null) {
            throw new BadRequestAlertException("A new projectValidator cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ProjectValidatorDTO result = projectValidatorServiceExt.create(projectValidatorDTO);
        return ResponseEntity.created(new URI("/api/project-validators/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /project-validators : Updates an existing projectValidator.
     *
     * @param projectValidatorDTO the projectValidatorDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated projectValidatorDTO,
     * or with status 400 (Bad Request) if the projectValidatorDTO is not valid,
     * or with status 500 (Internal Server Error) if the projectValidatorDTO couldn't be updated
     */
    @PutMapping(value = "/project-validators", params = {"override"})
    public ResponseEntity<ProjectValidatorDTO> updateProjectValidator(@Valid @RequestBody ProjectValidatorDTO projectValidatorDTO) {
        log.debug("REST request to update ProjectValidator : {}", projectValidatorDTO);
        if (projectValidatorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ProjectValidatorDTO result = projectValidatorServiceExt.update(projectValidatorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, projectValidatorDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /project-validators/current/:company_id : get the current project validator by company.
     *
     * @param companyId the company id of project Validator to get
     * @return the ResponseEntity with status 200 (OK) and with body the list of project validators in body
     */
    @GetMapping("/project-validators/current/{company_id}")
    public ResponseEntity<List<ProjectValidatorDTO>> getCurrentProjectValidators(@PathVariable("company_id") Long companyId) {
        log.debug("REST request to get Current project validator in company: {}", companyId);
        List<ProjectValidatorDTO> projectValidatorDTOS = projectValidatorServiceExt.getCurrentByCompany(companyId);
        return ResponseEntity.ok().body(projectValidatorDTOS);
    }

    /**
     * GET  /project-validators : get all the projectValidators.
     *
     * @param pageable  the pagination information
     * @param projectIds the ids list of projects
     * @param idIn      the list of ids
     * @return the ResponseEntity with status 200 (OK) and the list of projectValidators in body
     */
    @GetMapping(value = "/project-validators", params = {"override"})
    public ResponseEntity<List<ProjectValidatorDTO>> getAllProjectValidators(
        Pageable pageable,
        @RequestParam(value = "projectId.in", required = false) List<Long> projectIds,
        @RequestParam(value = "idIn", required = false) List<Long> idIn
    ) {
        log.debug("REST request to get a page of ProjectValidators by projectIds: {}, Ids: {}", projectIds, idIn);
        Page<ProjectValidatorDTO> page = projectValidatorServiceExt.findAll(pageable, projectIds, idIn);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/project-validators");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * PUT  /project-validators?ticket : Updates an existing projectValidator.
     *
     * @param ticket the ticket of projectValidatorDTO to update
     * @return the ResponseEntity with status 200 (OK)
     */
    @PutMapping(value = "/project-validators", params = {"ticket"})
    public ResponseEntity assignAccount(@Valid @RequestParam String ticket) {
        log.debug("REST request to assign a ProjectValidator to an user account by ticket : {}", ticket);
        try {
            projectValidatorServiceExt.assignToAccount(ticket);
        } catch (Exception cve) {
            throw new BadRequestAlertException("You already connected as project validator", ENTITY_NAME, "isunique");
        }
        return ResponseEntity.ok(200);
    }

    /**
     * GET /project-validators/new-tickets : Check for new projectValidator ticket.
     *
     * @return the ResponseEntity with status 200 (OK) and with body the projectValidatorDTO or null
     */
    @GetMapping(value = "/project-validators/new-tickets")
    public ResponseEntity checkNewTickets() {
        log.debug("REST request to check for new Project Validator ticket");
        Optional<ProjectValidatorDTO> projectValidatorDTO = projectValidatorServiceExt.checkNewTickets();
        return ResponseEntity.ok().body(projectValidatorDTO.orElse(null));
    }

    /**
     * GET  /project-validators/resend-ticket/:project_validator_id : resend a new invitation with ticket to Project Validator.
     *
     * @param projectValidatorId the id of Project Validator
     * @return the ResponseEntity with status 200 (OK) and with body ProjectValidatorDTO
     */
    @GetMapping("/project-validators/resend-ticket/{project_validator_id}")
    public ResponseEntity<ProjectValidatorDTO> resetTicket(@PathVariable("project_validator_id") Long projectValidatorId) {
        log.debug("REST request to resend a Project Validator invitation : {}", projectValidatorId);
        ProjectValidatorDTO result = projectValidatorServiceExt.resendTicket(projectValidatorId);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, projectValidatorId.toString()))
            .body(result);
    }
}
