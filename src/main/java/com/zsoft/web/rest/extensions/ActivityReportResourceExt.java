package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ActivityReportDTO;
import com.zsoft.service.extensions.ActivityReportServiceExt;
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
 * REST controller for managing ActivityReport.
 */
@RestController
@RequestMapping("/api")
public class ActivityReportResourceExt {
    private final Logger log = LoggerFactory.getLogger(ActivityReportResourceExt.class);

    private static final String ENTITY_NAME = "activityReport";

    private final ActivityReportServiceExt activityReportServiceExt;

    public ActivityReportResourceExt(ActivityReportServiceExt activityReportServiceExt) {
        this.activityReportServiceExt = activityReportServiceExt;
    }

    /**
     * GET  /activity-reports : get all the activityReports.
     *
     * @param pageable the pagination information
     * @param projectResourceIdIn the project resource ids list
     * @param month the month of report
     * @return the ResponseEntity with status 200 (OK) and the list of activityReports in body
     */
    @GetMapping(value = "/activity-reports", params = {"override", "projectResourceIdIn"})
    public ResponseEntity<List<ActivityReportDTO>> getAllActivityReportsByProjectResourceAndMonth(
        @RequestParam(value = "projectResourceIdIn") List<Long> projectResourceIdIn,
        @RequestParam(value = "month", required = false) LocalDate month,
        Pageable pageable
    ) {
        log.debug("REST request to get ActivityReports by projectResourceIdIn: {}, month: {}", projectResourceIdIn, month);
        Page<ActivityReportDTO> page = activityReportServiceExt.findAllReports(pageable, projectResourceIdIn, month);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/activity-reports");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /activity-reports : get all the activityReports.
     *
     * @param pageable the pagination information
     * @param resourceId the resource id of project resource
     * @param month the month of report
     * @return the ResponseEntity with status 200 (OK) and the list of activityReports in body
     */
    @GetMapping(value = "/activity-reports", params = {"override", "resourceId", "month"})
    public ResponseEntity<List<ActivityReportDTO>> getAllActivityReportsByResourceAndMonth(
        @RequestParam(value = "resourceId") Long resourceId,
        @RequestParam(value = "month") LocalDate month,
        Pageable pageable
    ) {
        log.debug("REST request to get ActivityReports by resourceId: {}, month: {}", resourceId, month);
        Page<ActivityReportDTO> page = activityReportServiceExt.findAllReports(pageable, resourceId, month);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/activity-reports");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /activity-reports : get all the activityReports.
     *
     * @param pageable the pagination information
     * @param resourceId the resource id of project resource
     * @return the ResponseEntity with status 200 (OK) and the list of activityReports in body
     */
    @GetMapping(value = "/activity-reports", params = {"override", "resourceId"})
    public ResponseEntity<List<ActivityReportDTO>> getAllActivityReportsByResource(
        @RequestParam(value = "resourceId") Long resourceId,
        Pageable pageable
    ) {
        log.debug("REST request to get ActivityReports by resourceId: {}", resourceId);
        Page<ActivityReportDTO> page = activityReportServiceExt.findAllReports(pageable, resourceId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/activity-reports");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /activity-reports : get all the activityReports.
     *
     * @param pageable the pagination information
     * @param month the month of report
     * @param companyId the company id of resource
     * @return the ResponseEntity with status 200 (OK) and the list of activityReports in body
     */
    @GetMapping(value = "/activity-reports", params = {"override", "month", "companyId"})
    public ResponseEntity<List<ActivityReportDTO>> getAllActivityReportsByCompanyAndMonth(
        @RequestParam(value = "month") LocalDate month,
        @RequestParam(value = "companyId") Long companyId,
        Pageable pageable
    ) {
        log.debug("REST request to get ActivityReports by companyId: {}, month: {}", companyId, month);
        Page<ActivityReportDTO> page = activityReportServiceExt.findAllReports(pageable, month, companyId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/activity-reports");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * POST  /activity-reports : Create a new activityReport.
     *
     * @param activityReportDTO the activityReportDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new activityReportDTO, or with status 400 (Bad Request) if the activityReport has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(value = "/activity-reports", params = {"override"})
    public ResponseEntity<ActivityReportDTO> createActivityReport(@Valid @RequestBody ActivityReportDTO activityReportDTO) throws URISyntaxException {
        log.debug("REST request to save ActivityReport : {}", activityReportDTO);
        if (activityReportDTO.getId() != null) {
            throw new BadRequestAlertException("A new activityReport cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ActivityReportDTO result = activityReportServiceExt.create(activityReportDTO);
        activityReportServiceExt.createHtmlTemplate(result.getId());
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
     */
    @PutMapping(value = "/activity-reports", params = {"override"})
    public ResponseEntity<ActivityReportDTO> updateActivityReport(@Valid @RequestBody ActivityReportDTO activityReportDTO) {
        log.debug("REST request to update ActivityReport : {}", activityReportDTO);
        if (activityReportDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ActivityReportDTO result = activityReportServiceExt.update(activityReportDTO);
        activityReportServiceExt.sendValidationEmail(result.getId());
        activityReportServiceExt.createHtmlTemplate(result.getId());
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, activityReportDTO.getId().toString()))
            .body(result);
    }

    /**
     * Get  /activity-reports/send-reminder : send an email of activity reports.
     *
     * @param activityReportIds the list of activityReport ids
     */
    @GetMapping("/activity-reports/send-reminder")
    public void sendReminders(@RequestParam("activityReportIds") List<Long> activityReportIds) {
        log.debug("REST request to send an email of activity reports : {}", activityReportIds);
        activityReportIds.forEach(activityReportServiceExt::sendReminder);
    }

    /**
     * Get  /activity-reports/send-validation-status : send an email with validation status of activity report.
     *
     * @param activityReportId the id of activityReport
     */
    @GetMapping("/activity-reports/send-validation-status")
    public ResponseEntity<ActivityReportDTO> sendValidationEmail(@RequestParam("activityReportId") Long activityReportId) {
        log.debug("REST request to send an email with validation status of activity report : {}", activityReportId);
        ActivityReportDTO result = activityReportServiceExt.sendValidationEmail(activityReportId);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, activityReportId.toString()))
            .body(result);
    }

    /**
     * Get  /activity-reports/:id/download : get PDF file of an Activty Report as Base64 encoded.
     *
     * @param id the id of the activityReport
     * @return the ResponseEntity with status 200 (OK) and the pdf file as Base64 encoded of Activty Report in body
     */
    @GetMapping("/activity-reports/{id}/download")
    public ResponseEntity<String> downloadPDF(@PathVariable Long id) {
        log.debug("REST request to get PDF file of an Activty Report: {}", id);
        return activityReportServiceExt.getActivityReportPDF(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new BadRequestAlertException("File not found", "Activty Report", "filenotfound"));
    }
}
