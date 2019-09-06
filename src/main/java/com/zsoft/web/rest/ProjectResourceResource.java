package com.zsoft.web.rest;
import com.zsoft.service.ProjectResourceService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ProjectResourceDTO;
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
 * REST controller for managing ProjectResource.
 */
@RestController
@RequestMapping("/api")
public class ProjectResourceResource {

    private final Logger log = LoggerFactory.getLogger(ProjectResourceResource.class);

    private static final String ENTITY_NAME = "projectResource";

    private final ProjectResourceService projectResourceService;

    public ProjectResourceResource(ProjectResourceService projectResourceService) {
        this.projectResourceService = projectResourceService;
    }

    /**
     * POST  /project-resources : Create a new projectResource.
     *
     * @param projectResourceDTO the projectResourceDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new projectResourceDTO, or with status 400 (Bad Request) if the projectResource has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/project-resources")
    public ResponseEntity<ProjectResourceDTO> createProjectResource(@Valid @RequestBody ProjectResourceDTO projectResourceDTO) throws URISyntaxException {
        log.debug("REST request to save ProjectResource : {}", projectResourceDTO);
        if (projectResourceDTO.getId() != null) {
            throw new BadRequestAlertException("A new projectResource cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ProjectResourceDTO result = projectResourceService.save(projectResourceDTO);
        return ResponseEntity.created(new URI("/api/project-resources/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /project-resources : Updates an existing projectResource.
     *
     * @param projectResourceDTO the projectResourceDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated projectResourceDTO,
     * or with status 400 (Bad Request) if the projectResourceDTO is not valid,
     * or with status 500 (Internal Server Error) if the projectResourceDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/project-resources")
    public ResponseEntity<ProjectResourceDTO> updateProjectResource(@Valid @RequestBody ProjectResourceDTO projectResourceDTO) throws URISyntaxException {
        log.debug("REST request to update ProjectResource : {}", projectResourceDTO);
        if (projectResourceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ProjectResourceDTO result = projectResourceService.save(projectResourceDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, projectResourceDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /project-resources : get all the projectResources.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of projectResources in body
     */
    @GetMapping("/project-resources")
    public ResponseEntity<List<ProjectResourceDTO>> getAllProjectResources(Pageable pageable) {
        log.debug("REST request to get a page of ProjectResources");
        Page<ProjectResourceDTO> page = projectResourceService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/project-resources");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /project-resources/:id : get the "id" projectResource.
     *
     * @param id the id of the projectResourceDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the projectResourceDTO, or with status 404 (Not Found)
     */
    @GetMapping("/project-resources/{id}")
    public ResponseEntity<ProjectResourceDTO> getProjectResource(@PathVariable Long id) {
        log.debug("REST request to get ProjectResource : {}", id);
        Optional<ProjectResourceDTO> projectResourceDTO = projectResourceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(projectResourceDTO);
    }

    /**
     * DELETE  /project-resources/:id : delete the "id" projectResource.
     *
     * @param id the id of the projectResourceDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/project-resources/{id}")
    public ResponseEntity<Void> deleteProjectResource(@PathVariable Long id) {
        log.debug("REST request to delete ProjectResource : {}", id);
        projectResourceService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
