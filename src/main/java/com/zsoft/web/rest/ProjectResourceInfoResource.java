package com.zsoft.web.rest;
import com.zsoft.service.ProjectResourceInfoService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ProjectResourceInfoDTO;
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
 * REST controller for managing ProjectResourceInfo.
 */
@RestController
@RequestMapping("/api")
public class ProjectResourceInfoResource {

    private final Logger log = LoggerFactory.getLogger(ProjectResourceInfoResource.class);

    private static final String ENTITY_NAME = "projectResourceInfo";

    private final ProjectResourceInfoService projectResourceInfoService;

    public ProjectResourceInfoResource(ProjectResourceInfoService projectResourceInfoService) {
        this.projectResourceInfoService = projectResourceInfoService;
    }

    /**
     * POST  /project-resource-infos : Create a new projectResourceInfo.
     *
     * @param projectResourceInfoDTO the projectResourceInfoDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new projectResourceInfoDTO, or with status 400 (Bad Request) if the projectResourceInfo has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/project-resource-infos")
    public ResponseEntity<ProjectResourceInfoDTO> createProjectResourceInfo(@Valid @RequestBody ProjectResourceInfoDTO projectResourceInfoDTO) throws URISyntaxException {
        log.debug("REST request to save ProjectResourceInfo : {}", projectResourceInfoDTO);
        if (projectResourceInfoDTO.getId() != null) {
            throw new BadRequestAlertException("A new projectResourceInfo cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ProjectResourceInfoDTO result = projectResourceInfoService.save(projectResourceInfoDTO);
        return ResponseEntity.created(new URI("/api/project-resource-infos/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /project-resource-infos : Updates an existing projectResourceInfo.
     *
     * @param projectResourceInfoDTO the projectResourceInfoDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated projectResourceInfoDTO,
     * or with status 400 (Bad Request) if the projectResourceInfoDTO is not valid,
     * or with status 500 (Internal Server Error) if the projectResourceInfoDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/project-resource-infos")
    public ResponseEntity<ProjectResourceInfoDTO> updateProjectResourceInfo(@Valid @RequestBody ProjectResourceInfoDTO projectResourceInfoDTO) throws URISyntaxException {
        log.debug("REST request to update ProjectResourceInfo : {}", projectResourceInfoDTO);
        if (projectResourceInfoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ProjectResourceInfoDTO result = projectResourceInfoService.save(projectResourceInfoDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, projectResourceInfoDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /project-resource-infos : get all the projectResourceInfos.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of projectResourceInfos in body
     */
    @GetMapping("/project-resource-infos")
    public ResponseEntity<List<ProjectResourceInfoDTO>> getAllProjectResourceInfos(Pageable pageable) {
        log.debug("REST request to get a page of ProjectResourceInfos");
        Page<ProjectResourceInfoDTO> page = projectResourceInfoService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/project-resource-infos");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /project-resource-infos/:id : get the "id" projectResourceInfo.
     *
     * @param id the id of the projectResourceInfoDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the projectResourceInfoDTO, or with status 404 (Not Found)
     */
    @GetMapping("/project-resource-infos/{id}")
    public ResponseEntity<ProjectResourceInfoDTO> getProjectResourceInfo(@PathVariable Long id) {
        log.debug("REST request to get ProjectResourceInfo : {}", id);
        Optional<ProjectResourceInfoDTO> projectResourceInfoDTO = projectResourceInfoService.findOne(id);
        return ResponseUtil.wrapOrNotFound(projectResourceInfoDTO);
    }

    /**
     * DELETE  /project-resource-infos/:id : delete the "id" projectResourceInfo.
     *
     * @param id the id of the projectResourceInfoDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/project-resource-infos/{id}")
    public ResponseEntity<Void> deleteProjectResourceInfo(@PathVariable Long id) {
        log.debug("REST request to delete ProjectResourceInfo : {}", id);
        projectResourceInfoService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
