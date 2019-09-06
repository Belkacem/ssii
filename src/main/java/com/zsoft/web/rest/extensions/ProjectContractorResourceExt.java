package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ProjectContractorDTO;
import com.zsoft.service.extensions.ProjectContractorServiceExt;
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
 * REST controller for managing ProjectContractor.
 */
@RestController
@RequestMapping("/api")
public class ProjectContractorResourceExt {

    private final Logger log = LoggerFactory.getLogger(ProjectContractorResourceExt.class);

    private static final String ENTITY_NAME = "projectContractor";

    private final ProjectContractorServiceExt projectContractorServiceExt;

    public ProjectContractorResourceExt(ProjectContractorServiceExt projectContractorServiceExt) {
        this.projectContractorServiceExt = projectContractorServiceExt;
    }

    /**
     * GET  /project-contractors : get all the projectContractors.
     *
     * @param pageable  the pagination information
     * @param projectIds the ids list of projects
     * @return the ResponseEntity with status 200 (OK) and the list of projectContractors in body
     */
    @GetMapping(value = "/project-contractors", params = {"override"})
    public ResponseEntity<List<ProjectContractorDTO>> getAllProjectContractors(
        Pageable pageable,
        @RequestParam(value = "projectId.in", required = false) List<Long> projectIds
    ) {
        log.debug("REST request to get a page of ProjectContractors by projectId: [{}]", projectIds);
        Page<ProjectContractorDTO> page = projectContractorServiceExt.findAll(pageable, projectIds);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/project-contractors");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * POST  /project-contractors : Create a new projectContractor.
     *
     * @param projectContractorDTO the projectContractorDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new projectContractorDTO, or with status 400 (Bad Request) if the projectContractor has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(value = "/project-contractors", params = {"override"})
    public ResponseEntity<ProjectContractorDTO> createProjectContractor(@Valid @RequestBody ProjectContractorDTO projectContractorDTO) throws URISyntaxException {
        log.debug("REST request to save Project Contractor : {}", projectContractorDTO);
        if (projectContractorDTO.getId() != null) {
            throw new BadRequestAlertException("A new projectContractor cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ProjectContractorDTO result = projectContractorServiceExt.create(projectContractorDTO);
        return ResponseEntity.created(new URI("/api/project-contractors/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * GET  /project-contractors/current/:company_id : get the current project contractors by company.
     *
     * @param companyId the company id of project contractors to get
     * @return the ResponseEntity with status 200 (OK) and with body the list of project contractors in body
     */
    @GetMapping("/project-contractors/current/{company_id}")
    public ResponseEntity<List<ProjectContractorDTO>> getCurrentProjectContractors(@PathVariable("company_id") Long companyId) {
        log.debug("REST request to get Current project contractors in company: {}", companyId);
        List<ProjectContractorDTO> projectContractorDTOS = projectContractorServiceExt.getCurrentByCompany(companyId);
        return ResponseEntity.ok().body(projectContractorDTOS);
    }

    /**
     * PUT  /project-contractors?ticket : Updates an existing projectContractor.
     *
     * @param ticket the ticket of projectContractor to update
     * @return the ResponseEntity with status 200 (OK)
     */
    @PutMapping(value = "/project-contractors", params = {"ticket"})
    public ResponseEntity assignAccount(@Valid @RequestParam String ticket) {
        log.debug("REST request to assign a Project Contractor to an user account by ticket : {}", ticket);
        try {
            projectContractorServiceExt.assignToAccount(ticket);
        } catch (Exception cve) {
            throw new BadRequestAlertException("You already connected as project contractor", ENTITY_NAME, "isunique");
        }
        return ResponseEntity.ok(200);
    }

    /**
     * GET /project-contractors/new-tickets : Check for new projectContractor ticket.
     *
     * @return the ResponseEntity with status 200 (OK) and with body the projectContractorDTO or null
     */
    @GetMapping(value = "/project-contractors/new-tickets")
    public ResponseEntity checkNewTickets() {
        log.debug("REST request to check for new Project Contractor ticket");
        Optional<ProjectContractorDTO> projectContractorDTO = projectContractorServiceExt.checkNewTickets();
        return ResponseEntity.ok().body(projectContractorDTO.orElse(null));
    }

    /**
     * GET  /project-contractors/resend-ticket/:project_contractor_id : resend a new invitation with ticket to Project Contractor.
     *
     * @param projectContractorId the id of Project Contractor
     * @return the ResponseEntity with status 200 (OK) and with body ProjectContractorDTO
     */
    @GetMapping("/project-contractors/resend-ticket/{project_contractor_id}")
    public ResponseEntity<ProjectContractorDTO> resetTicket(@PathVariable("project_contractor_id") Long projectContractorId) {
        log.debug("REST request to resend a Project Contractor invitation : {}", projectContractorId);
        ProjectContractorDTO result = projectContractorServiceExt.resendTicket(projectContractorId);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, projectContractorId.toString()))
            .body(result);
    }
}
