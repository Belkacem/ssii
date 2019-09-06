package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ProjectResourceInfoDTO;
import com.zsoft.service.extensions.ActivityReportServiceExt;
import com.zsoft.service.extensions.ProjectResourceInfoServiceExt;
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
import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for managing ProjectResourceInfo.
 */
@RestController
@RequestMapping("/api")
public class ProjectResourceInfoResourceExt {

    private final Logger log = LoggerFactory.getLogger(ProjectResourceInfoResourceExt.class);

    private static final String ENTITY_NAME = "projectResourceInfo";

    private final ProjectResourceInfoServiceExt projectResourceInfoServiceExt;

    private final ActivityReportServiceExt activityReportServiceExt;

    public ProjectResourceInfoResourceExt(ProjectResourceInfoServiceExt projectResourceInfoServiceExt, ActivityReportServiceExt activityReportServiceExt) {
        this.projectResourceInfoServiceExt = projectResourceInfoServiceExt;
        this.activityReportServiceExt = activityReportServiceExt;
    }

    /**
     * GET  /project-resource-infos : get all the projectResourceInfos.
     *
     * @param pageable            the pagination information
     * @param projectResourceIdIn the List of project resource ids
     * @return the ResponseEntity with status 200 (OK) and the list of projectResourceInfos in body
     */
    @GetMapping(value = "/project-resource-infos", params = {"override"})
    public ResponseEntity<List<ProjectResourceInfoDTO>> getAllProjectResourceInfos(
        Pageable pageable,
        @RequestParam(value = "projectResourceIdIn", required = false) List<Long> projectResourceIdIn
    ) {
        log.debug("REST request to get a page of ProjectResourceInfos by projectResourceIds: {}", projectResourceIdIn);
        Page<ProjectResourceInfoDTO> page = projectResourceInfoServiceExt.findAll(pageable, projectResourceIdIn);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/project-resource-infos");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * POST  /project-resource-infos : Create a new projectResourceInfo.
     *
     * @param projectResourceInfoDTO the projectResourceInfoDTO to create
     * @param months list of months to create activity reports
     * @return the ResponseEntity with status 201 (Created) and with body the new projectResourceInfoDTO, or with status 400 (Bad Request) if the projectResourceInfo has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(value = "/project-resource-infos", params = {"months"})
    public ResponseEntity<ProjectResourceInfoDTO> createProjectResourceInfo(
        @Valid @RequestBody ProjectResourceInfoDTO projectResourceInfoDTO,
        @RequestParam("months") List<LocalDate> months
    ) throws URISyntaxException {
        log.debug("REST request to save ProjectResourceInfo : {} , with activity reports on months: {}", projectResourceInfoDTO, months);
        if (projectResourceInfoDTO.getId() != null) {
            throw new BadRequestAlertException("A new projectResourceInfo cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ProjectResourceInfoDTO result = projectResourceInfoServiceExt.save(projectResourceInfoDTO);
        activityReportServiceExt.createActivityReport(result.getProjectResourceId(), months);
        return ResponseEntity.created(new URI("/api/project-resource-infos/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /project-resource-infos : Updates an existing projectResourceInfo.
     *
     * @param projectResourceInfoDTO the projectResourceInfoDTO to update
     * @param months list of months to create activity reports
     * @return the ResponseEntity with status 200 (OK) and with body the updated projectResourceInfoDTO,
     * or with status 400 (Bad Request) if the projectResourceInfoDTO is not valid,
     * or with status 500 (Internal Server Error) if the projectResourceInfoDTO couldn't be updated
     */
    @PutMapping(value = "/project-resource-infos", params = {"months"})
    public ResponseEntity<ProjectResourceInfoDTO> updateProjectResourceInfo(
        @Valid @RequestBody ProjectResourceInfoDTO projectResourceInfoDTO,
        @RequestParam("months") List<LocalDate> months
    ){
        log.debug("REST request to update ProjectResourceInfo : {} , with activity reports on months: {}", projectResourceInfoDTO, months);
        if (projectResourceInfoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ProjectResourceInfoDTO result = projectResourceInfoServiceExt.save(projectResourceInfoDTO);
        activityReportServiceExt.createActivityReport(result.getProjectResourceId(), months);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, projectResourceInfoDTO.getId().toString()))
            .body(result);
    }
}
