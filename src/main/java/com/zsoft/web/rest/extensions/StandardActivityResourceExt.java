package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.StandardActivityDTO;
import com.zsoft.service.extensions.StandardActivityServiceExt;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for managing StandardActivity.
 */
@RestController
@RequestMapping("/api")
public class StandardActivityResourceExt {

    private final Logger log = LoggerFactory.getLogger(StandardActivityResourceExt.class);

    private static final String ENTITY_NAME = "standardActivity";

    private final StandardActivityServiceExt standardActivityServiceExt;

    public StandardActivityResourceExt(StandardActivityServiceExt standardActivityServiceExt) {
        this.standardActivityServiceExt = standardActivityServiceExt;
    }

    /**
     * POST  /standard-activities/bulk : Bulk Create a new standardActivities.
     *
     * @param standardActivityDTOs the list of standardActivityDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new standardActivityDTOs,
     * or with status 400 (Bad Request) if the standardActivity has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/standard-activities/bulk")
    public ResponseEntity<List<StandardActivityDTO>> createStandardActivity(@Valid @RequestBody List<StandardActivityDTO> standardActivityDTOs) throws URISyntaxException {
        log.debug("REST request to save Standard Activities : {}", standardActivityDTOs);
        standardActivityDTOs.forEach(standardActivityDTO -> {
            if (standardActivityDTO.getId() != null) {
                throw new BadRequestAlertException("A new standardActivity cannot already have an ID", ENTITY_NAME, "idexists");
            }
        });
        List<StandardActivityDTO> result = standardActivityServiceExt.bulkSave(standardActivityDTOs);
        return ResponseEntity.ok().body(result);
    }

    /**
     * PUT  /standard-activities : Bulk Updates an existing Standard Activities.
     *
     * @param standardActivityDTOs the list of StandardActivityDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated standardActivityDTOs,
     * or with status 400 (Bad Request) if the standardActivityDTOs is not valid,
     * or with status 500 (Internal Server Error) if the standardActivityDTOs couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/standard-activities/bulk")
    public ResponseEntity<List<StandardActivityDTO>> bulkUpdate(@Valid @RequestBody List<StandardActivityDTO> standardActivityDTOs) throws URISyntaxException {
        log.debug("REST request to update Standard Activities : {}", standardActivityDTOs);
        standardActivityDTOs.forEach(standardActivityDTO -> {
            if (standardActivityDTO.getId() == null) {
                throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
            }
        });
        List<StandardActivityDTO> result = standardActivityServiceExt.bulkSave(standardActivityDTOs);
        return ResponseEntity.ok().body(result);
    }

    /**
     * DELETE  /standard-activities : bulk delete Standard Activities.
     *
     * @param standardActivityIds the list of Standard Activity id to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/standard-activities/bulk")
    public ResponseEntity<Void> bulkDelete(@RequestParam("ids") List<Long> standardActivityIds) {
        log.debug("REST request to delete Standard Activities : {}", standardActivityIds);
        standardActivityServiceExt.bulkDelete(standardActivityIds);
        return ResponseEntity.ok().build();
    }

    /**
     * GET  /standard-activities : Get Standard Activities.
     *
     * @param pageable           the pagination information
     * @param activityReportIdIn the list if activity report IDs
     * @param resourceId         the Resource ID
     * @param startDate          the start of month
     * @param endDate            the end of month
     * @return the ResponseEntity with status 200 (OK) and with body the standardActivityDTOs
     */
    @GetMapping(value = "/standard-activities", params = {"override"})
    public ResponseEntity<List<StandardActivityDTO>> getStandardActivities(
        Pageable pageable,
        @RequestParam(value = "activityReportIdIn", required = false) List<Long> activityReportIdIn,
        @RequestParam(value = "resourceId", required = false) Long resourceId,
        @RequestParam(value = "startDate", required = false) LocalDate startDate,
        @RequestParam(value = "endDate", required = false) LocalDate endDate
    ) {
        log.debug("REST request to get Standard Activities of resource: {}", resourceId);
        Page<StandardActivityDTO> page = standardActivityServiceExt.findAll(pageable, activityReportIdIn, resourceId, startDate, endDate);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/exceptional-activities");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
