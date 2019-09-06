package com.zsoft.web.rest;
import com.zsoft.service.ProjectValidatorService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ProjectValidatorDTO;
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
 * REST controller for managing ProjectValidator.
 */
@RestController
@RequestMapping("/api")
public class ProjectValidatorResource {

    private final Logger log = LoggerFactory.getLogger(ProjectValidatorResource.class);

    private static final String ENTITY_NAME = "projectValidator";

    private final ProjectValidatorService projectValidatorService;

    public ProjectValidatorResource(ProjectValidatorService projectValidatorService) {
        this.projectValidatorService = projectValidatorService;
    }

    /**
     * POST  /project-validators : Create a new projectValidator.
     *
     * @param projectValidatorDTO the projectValidatorDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new projectValidatorDTO, or with status 400 (Bad Request) if the projectValidator has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/project-validators")
    public ResponseEntity<ProjectValidatorDTO> createProjectValidator(@Valid @RequestBody ProjectValidatorDTO projectValidatorDTO) throws URISyntaxException {
        log.debug("REST request to save ProjectValidator : {}", projectValidatorDTO);
        if (projectValidatorDTO.getId() != null) {
            throw new BadRequestAlertException("A new projectValidator cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ProjectValidatorDTO result = projectValidatorService.save(projectValidatorDTO);
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
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/project-validators")
    public ResponseEntity<ProjectValidatorDTO> updateProjectValidator(@Valid @RequestBody ProjectValidatorDTO projectValidatorDTO) throws URISyntaxException {
        log.debug("REST request to update ProjectValidator : {}", projectValidatorDTO);
        if (projectValidatorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ProjectValidatorDTO result = projectValidatorService.save(projectValidatorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, projectValidatorDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /project-validators : get all the projectValidators.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of projectValidators in body
     */
    @GetMapping("/project-validators")
    public ResponseEntity<List<ProjectValidatorDTO>> getAllProjectValidators(Pageable pageable) {
        log.debug("REST request to get a page of ProjectValidators");
        Page<ProjectValidatorDTO> page = projectValidatorService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/project-validators");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /project-validators/:id : get the "id" projectValidator.
     *
     * @param id the id of the projectValidatorDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the projectValidatorDTO, or with status 404 (Not Found)
     */
    @GetMapping("/project-validators/{id}")
    public ResponseEntity<ProjectValidatorDTO> getProjectValidator(@PathVariable Long id) {
        log.debug("REST request to get ProjectValidator : {}", id);
        Optional<ProjectValidatorDTO> projectValidatorDTO = projectValidatorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(projectValidatorDTO);
    }

    /**
     * DELETE  /project-validators/:id : delete the "id" projectValidator.
     *
     * @param id the id of the projectValidatorDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/project-validators/{id}")
    public ResponseEntity<Void> deleteProjectValidator(@PathVariable Long id) {
        log.debug("REST request to delete ProjectValidator : {}", id);
        projectValidatorService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
