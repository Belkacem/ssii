package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ProjectResourceDTO;
import com.zsoft.service.extensions.ActivityReportServiceExt;
import com.zsoft.service.extensions.ProjectResourceServiceExt;
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
 * REST controller for managing ProjectResource.
 */
@RestController
@RequestMapping("/api")
public class ProjectResourceResourceExt {

    private final Logger log = LoggerFactory.getLogger(ProjectResourceResourceExt.class);

    private static final String ENTITY_NAME = "projectResource";

    private final ProjectResourceServiceExt projectResourceServiceExt;

    public ProjectResourceResourceExt(ProjectResourceServiceExt projectResourceServiceExt) {
        this.projectResourceServiceExt = projectResourceServiceExt;
    }

    /**
     * POST  /project-resources : Create a new projectResource.
     *
     * @param projectResourceDTO the projectResourceDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new projectResourceDTO, or with status 400 (Bad Request) if the projectResource has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(value = "/project-resources", params = {"creation"})
    public ResponseEntity<ProjectResourceDTO> createProjectResource(@Valid @RequestBody ProjectResourceDTO projectResourceDTO) throws URISyntaxException {
        log.debug("REST request to save ProjectResource : {}", projectResourceDTO);
        if (projectResourceDTO.getId() != null) {
            throw new BadRequestAlertException("A new projectResource cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ProjectResourceDTO result = projectResourceServiceExt.create(projectResourceDTO);
        return ResponseEntity.created(new URI("/api/project-resources/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * GET  /project-resources : get all the projectResources.
     *
     * @param pageable    the pagination information
     * @param projectIdIn the list of project ids
     * @param idIn        the list of project resource ids
     * @param resourceId  the id of resource
     * @return the ResponseEntity with status 200 (OK) and the list of projectResources in body
     */
    @GetMapping(value = "/project-resources", params = {"override"})
    public ResponseEntity<List<ProjectResourceDTO>> getAllProjectResources(
        Pageable pageable,
        @RequestParam(value = "projectIdIn", required = false) List<Long> projectIdIn,
        @RequestParam(value = "idIn", required = false) List<Long> idIn,
        @RequestParam(value = "resourceId", required = false) Long resourceId
    ) {
        log.debug("REST request to get a page of ProjectResources by projectIds: {}, Ids: {}, resourceId: {}", projectIdIn, idIn, resourceId);
        Page<ProjectResourceDTO> page = projectResourceServiceExt.findAll(pageable, projectIdIn, idIn, resourceId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/project-resources");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
