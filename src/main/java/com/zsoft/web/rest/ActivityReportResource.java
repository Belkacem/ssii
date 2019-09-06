package com.zsoft.web.rest;
import com.zsoft.service.ActivityReportService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ActivityReportDTO;
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
 * REST controller for managing ActivityReport.
 */
@RestController
@RequestMapping("/api")
public class ActivityReportResource {

    private final Logger log = LoggerFactory.getLogger(ActivityReportResource.class);

    private static final String ENTITY_NAME = "activityReport";

    private final ActivityReportService activityReportService;

    public ActivityReportResource(ActivityReportService activityReportService) {
        this.activityReportService = activityReportService;
    }

    /**
     * POST  /activity-reports : Create a new activityReport.
     *
     * @param activityReportDTO the activityReportDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new activityReportDTO, or with status 400 (Bad Request) if the activityReport has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/activity-reports")
    public ResponseEntity<ActivityReportDTO> createActivityReport(@Valid @RequestBody ActivityReportDTO activityReportDTO) throws URISyntaxException {
        log.debug("REST request to save ActivityReport : {}", activityReportDTO);
        if (activityReportDTO.getId() != null) {
            throw new BadRequestAlertException("A new activityReport cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ActivityReportDTO result = activityReportService.save(activityReportDTO);
        return ResponseEntity.created(new URI("/api/activity-reports/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /activity-reports : Updates an existing activityReport.
     *
     * @param activityReportDTO the activityReportDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated activityReportDTO,
     * or with status 400 (Bad Request) if the activityReportDTO is not valid,
     * or with status 500 (Internal Server Error) if the activityReportDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/activity-reports")
    public ResponseEntity<ActivityReportDTO> updateActivityReport(@Valid @RequestBody ActivityReportDTO activityReportDTO) throws URISyntaxException {
        log.debug("REST request to update ActivityReport : {}", activityReportDTO);
        if (activityReportDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ActivityReportDTO result = activityReportService.save(activityReportDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, activityReportDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /activity-reports : get all the activityReports.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of activityReports in body
     */
    @GetMapping("/activity-reports")
    public ResponseEntity<List<ActivityReportDTO>> getAllActivityReports(Pageable pageable) {
        log.debug("REST request to get a page of ActivityReports");
        Page<ActivityReportDTO> page = activityReportService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/activity-reports");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /activity-reports/:id : get the "id" activityReport.
     *
     * @param id the id of the activityReportDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the activityReportDTO, or with status 404 (Not Found)
     */
    @GetMapping("/activity-reports/{id}")
    public ResponseEntity<ActivityReportDTO> getActivityReport(@PathVariable Long id) {
        log.debug("REST request to get ActivityReport : {}", id);
        Optional<ActivityReportDTO> activityReportDTO = activityReportService.findOne(id);
        return ResponseUtil.wrapOrNotFound(activityReportDTO);
    }

    /**
     * DELETE  /activity-reports/:id : delete the "id" activityReport.
     *
     * @param id the id of the activityReportDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/activity-reports/{id}")
    public ResponseEntity<Void> deleteActivityReport(@PathVariable Long id) {
        log.debug("REST request to delete ActivityReport : {}", id);
        activityReportService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
