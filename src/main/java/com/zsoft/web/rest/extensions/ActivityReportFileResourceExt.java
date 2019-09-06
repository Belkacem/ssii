package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ActivityReportFileDTO;
import com.zsoft.service.extensions.ActivityReportFileServiceExt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing ActivityReportFile.
 */
@RestController
@RequestMapping("/api")
public class ActivityReportFileResourceExt {

    private final Logger log = LoggerFactory.getLogger(ActivityReportFileResourceExt.class);

    private final ActivityReportFileServiceExt activityReportFileServiceExt;

    public ActivityReportFileResourceExt(ActivityReportFileServiceExt activityReportFileServiceExt) {
        this.activityReportFileServiceExt = activityReportFileServiceExt;
    }

    /**
     * GET  /activity-report-files/:activity_report_ids : get all the activityReportFiles by activityReportsIds.
     *
     * @param activityReportIds the ids  list of the ActivityReports
     * @return the ResponseEntity with status 200 (OK) and the list of activityReportFiles in body
     */
    @GetMapping(value = "/activity-report-files/{activity_report_ids}", params = {"override"})
    public ResponseEntity<List<ActivityReportFileDTO>> getAllActivityReportFiles(@PathVariable(value = "activity_report_ids") List<Long> activityReportIds) {
        log.debug("REST request to get a page of ActivityReportFiles by activityReportIds: {}", activityReportIds);
        List<ActivityReportFileDTO> activityReportFiles = activityReportFileServiceExt.getFiles(activityReportIds);
        return ResponseEntity.ok().body(activityReportFiles);
    }
}
