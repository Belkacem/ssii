package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ProjectDTO;
import com.zsoft.service.extensions.ProjectServiceExt;
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

/**
 * REST controller for managing Project.
 */
@RestController
@RequestMapping("/api")
public class ProjectResourceExt {

    private final Logger log = LoggerFactory.getLogger(ProjectResourceExt.class);

    private static final String ENTITY_NAME = "project";

    private final ProjectServiceExt projectServiceExt;

    public ProjectResourceExt(ProjectServiceExt projectServiceExt) {
        this.projectServiceExt = projectServiceExt;
    }

    /**
     * POST  /projects : Create a new project.
     *
     * @param projectDTO the projectDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new projectDTO, or with status 400 (Bad Request) if the project has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(value = "/projects", params = {"override"})
    public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody ProjectDTO projectDTO) throws URISyntaxException {
        log.debug("REST request to save Project : {}", projectDTO);
        if (projectDTO.getId() != null) {
            throw new BadRequestAlertException("A new project cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ProjectDTO result = projectServiceExt.create(projectDTO);
        return ResponseEntity.created(new URI("/api/projects/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * GET  /projects : get all the projects.
     *
     * @param pageable  the pagination information
     * @param companyId the id of project company
     * @param ids      the list of project ids
     * @return the ResponseEntity with status 200 (OK) and the list of projects in body
     */
    @GetMapping(value = "/projects", params = {"override"})
    public ResponseEntity<List<ProjectDTO>> getAllProjects(
        Pageable pageable,
        @RequestParam(value = "companyId", required = false) Long companyId,
        @RequestParam(value = "idIn", required = false) List<Long> ids
    ) {
        log.debug("REST request to get a page of Projects by companyId: {}, ids: {}", companyId, ids);
        Page<ProjectDTO> page = projectServiceExt.findAll(pageable, companyId, ids);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/projects");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
