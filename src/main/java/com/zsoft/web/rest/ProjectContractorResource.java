package com.zsoft.web.rest;
import com.zsoft.service.ProjectContractorService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ProjectContractorDTO;
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
 * REST controller for managing ProjectContractor.
 */
@RestController
@RequestMapping("/api")
public class ProjectContractorResource {

    private final Logger log = LoggerFactory.getLogger(ProjectContractorResource.class);

    private static final String ENTITY_NAME = "projectContractor";

    private final ProjectContractorService projectContractorService;

    public ProjectContractorResource(ProjectContractorService projectContractorService) {
        this.projectContractorService = projectContractorService;
    }

    /**
     * POST  /project-contractors : Create a new projectContractor.
     *
     * @param projectContractorDTO the projectContractorDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new projectContractorDTO, or with status 400 (Bad Request) if the projectContractor has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/project-contractors")
    public ResponseEntity<ProjectContractorDTO> createProjectContractor(@Valid @RequestBody ProjectContractorDTO projectContractorDTO) throws URISyntaxException {
        log.debug("REST request to save ProjectContractor : {}", projectContractorDTO);
        if (projectContractorDTO.getId() != null) {
            throw new BadRequestAlertException("A new projectContractor cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ProjectContractorDTO result = projectContractorService.save(projectContractorDTO);
        return ResponseEntity.created(new URI("/api/project-contractors/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /project-contractors : Updates an existing projectContractor.
     *
     * @param projectContractorDTO the projectContractorDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated projectContractorDTO,
     * or with status 400 (Bad Request) if the projectContractorDTO is not valid,
     * or with status 500 (Internal Server Error) if the projectContractorDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/project-contractors")
    public ResponseEntity<ProjectContractorDTO> updateProjectContractor(@Valid @RequestBody ProjectContractorDTO projectContractorDTO) throws URISyntaxException {
        log.debug("REST request to update ProjectContractor : {}", projectContractorDTO);
        if (projectContractorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ProjectContractorDTO result = projectContractorService.save(projectContractorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, projectContractorDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /project-contractors : get all the projectContractors.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of projectContractors in body
     */
    @GetMapping("/project-contractors")
    public ResponseEntity<List<ProjectContractorDTO>> getAllProjectContractors(Pageable pageable) {
        log.debug("REST request to get a page of ProjectContractors");
        Page<ProjectContractorDTO> page = projectContractorService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/project-contractors");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /project-contractors/:id : get the "id" projectContractor.
     *
     * @param id the id of the projectContractorDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the projectContractorDTO, or with status 404 (Not Found)
     */
    @GetMapping("/project-contractors/{id}")
    public ResponseEntity<ProjectContractorDTO> getProjectContractor(@PathVariable Long id) {
        log.debug("REST request to get ProjectContractor : {}", id);
        Optional<ProjectContractorDTO> projectContractorDTO = projectContractorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(projectContractorDTO);
    }

    /**
     * DELETE  /project-contractors/:id : delete the "id" projectContractor.
     *
     * @param id the id of the projectContractorDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/project-contractors/{id}")
    public ResponseEntity<Void> deleteProjectContractor(@PathVariable Long id) {
        log.debug("REST request to delete ProjectContractor : {}", id);
        projectContractorService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
