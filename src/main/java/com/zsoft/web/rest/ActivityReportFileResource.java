package com.zsoft.web.rest;
import com.zsoft.service.ActivityReportFileService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ActivityReportFileDTO;
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
 * REST controller for managing ActivityReportFile.
 */
@RestController
@RequestMapping("/api")
public class ActivityReportFileResource {

    private final Logger log = LoggerFactory.getLogger(ActivityReportFileResource.class);

    private static final String ENTITY_NAME = "activityReportFile";

    private final ActivityReportFileService activityReportFileService;

    public ActivityReportFileResource(ActivityReportFileService activityReportFileService) {
        this.activityReportFileService = activityReportFileService;
    }

    /**
     * POST  /activity-report-files : Create a new activityReportFile.
     *
     * @param activityReportFileDTO the activityReportFileDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new activityReportFileDTO, or with status 400 (Bad Request) if the activityReportFile has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/activity-report-files")
    public ResponseEntity<ActivityReportFileDTO> createActivityReportFile(@Valid @RequestBody ActivityReportFileDTO activityReportFileDTO) throws URISyntaxException {
        log.debug("REST request to save ActivityReportFile : {}", activityReportFileDTO);
        if (activityReportFileDTO.getId() != null) {
            throw new BadRequestAlertException("A new activityReportFile cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ActivityReportFileDTO result = activityReportFileService.save(activityReportFileDTO);
        return ResponseEntity.created(new URI("/api/activity-report-files/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /activity-report-files : Updates an existing activityReportFile.
     *
     * @param activityReportFileDTO the activityReportFileDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated activityReportFileDTO,
     * or with status 400 (Bad Request) if the activityReportFileDTO is not valid,
     * or with status 500 (Internal Server Error) if the activityReportFileDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/activity-report-files")
    public ResponseEntity<ActivityReportFileDTO> updateActivityReportFile(@Valid @RequestBody ActivityReportFileDTO activityReportFileDTO) throws URISyntaxException {
        log.debug("REST request to update ActivityReportFile : {}", activityReportFileDTO);
        if (activityReportFileDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ActivityReportFileDTO result = activityReportFileService.save(activityReportFileDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, activityReportFileDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /activity-report-files : get all the activityReportFiles.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of activityReportFiles in body
     */
    @GetMapping("/activity-report-files")
    public ResponseEntity<List<ActivityReportFileDTO>> getAllActivityReportFiles(Pageable pageable) {
        log.debug("REST request to get a page of ActivityReportFiles");
        Page<ActivityReportFileDTO> page = activityReportFileService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/activity-report-files");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /activity-report-files/:id : get the "id" activityReportFile.
     *
     * @param id the id of the activityReportFileDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the activityReportFileDTO, or with status 404 (Not Found)
     */
    @GetMapping("/activity-report-files/{id}")
    public ResponseEntity<ActivityReportFileDTO> getActivityReportFile(@PathVariable Long id) {
        log.debug("REST request to get ActivityReportFile : {}", id);
        Optional<ActivityReportFileDTO> activityReportFileDTO = activityReportFileService.findOne(id);
        return ResponseUtil.wrapOrNotFound(activityReportFileDTO);
    }

    /**
     * DELETE  /activity-report-files/:id : delete the "id" activityReportFile.
     *
     * @param id the id of the activityReportFileDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/activity-report-files/{id}")
    public ResponseEntity<Void> deleteActivityReportFile(@PathVariable Long id) {
        log.debug("REST request to delete ActivityReportFile : {}", id);
        activityReportFileService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
