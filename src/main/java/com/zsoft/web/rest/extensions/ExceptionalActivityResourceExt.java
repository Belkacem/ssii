package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ExceptionalActivityDTO;
import com.zsoft.service.extensions.ExceptionalActivityServiceExt;
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
 * REST controller for managing ExceptionalActivity.
 */
@RestController
@RequestMapping("/api")
public class ExceptionalActivityResourceExt {

    private final Logger log = LoggerFactory.getLogger(ExceptionalActivityResourceExt.class);

    private static final String ENTITY_NAME = "exceptionalActivity";

    private final ExceptionalActivityServiceExt exceptionalActivityServiceExt;

    public ExceptionalActivityResourceExt(ExceptionalActivityServiceExt exceptionalActivityServiceExt) {
        this.exceptionalActivityServiceExt = exceptionalActivityServiceExt;
    }

    /**
     * POST  /exceptional-activities : Bulk Create a new Exceptional Activities.
     *
     * @param exceptionalActivityDTOs the list of ExceptionalActivityDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new exceptionalActivityDTOs,
     * or with status 400 (Bad Request) if the Exceptional Activity has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/exceptional-activities/bulk")
    public ResponseEntity<List<ExceptionalActivityDTO>> bulkCreate(@Valid @RequestBody List<ExceptionalActivityDTO> exceptionalActivityDTOs) throws URISyntaxException {
        log.debug("REST request to save Exceptional Activities : {}", exceptionalActivityDTOs);
        exceptionalActivityDTOs.forEach(exceptionalActivityDTO -> {
            if (exceptionalActivityDTO.getId() != null) {
                throw new BadRequestAlertException("A new Exceptional Activity cannot already have an ID", ENTITY_NAME, "idexists");
            }
        });
        List<ExceptionalActivityDTO> result = exceptionalActivityServiceExt.bulkSave(exceptionalActivityDTOs);
        return ResponseEntity.ok().body(result);
    }

    /**
     * PUT  /exceptional-activities : Bulk Updates an existing Exceptional Activities.
     *
     * @param exceptionalActivityDTOs the list of ExceptionalActivityDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated exceptionalActivityDTOs,
     * or with status 400 (Bad Request) if the exceptionalActivityDTOs is not valid,
     * or with status 500 (Internal Server Error) if the exceptionalActivityDTOs couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/exceptional-activities/bulk")
    public ResponseEntity<List<ExceptionalActivityDTO>> bulkUpdate(@Valid @RequestBody List<ExceptionalActivityDTO> exceptionalActivityDTOs) throws URISyntaxException {
        log.debug("REST request to update Exceptional Activities : {}", exceptionalActivityDTOs);
        exceptionalActivityDTOs.forEach(exceptionalActivityDTO -> {
            if (exceptionalActivityDTO.getId() == null) {
                throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
            }
        });
        List<ExceptionalActivityDTO> result = exceptionalActivityServiceExt.bulkSave(exceptionalActivityDTOs);
        return ResponseEntity.ok().body(result);
    }

    /**
     * DELETE  /exceptional-activities : bulk delete Exceptional Activities.
     *
     * @param exceptionalActivityIds the ids of the Exceptional Activity to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/exceptional-activities")
    public ResponseEntity<Void> bulkDelete(@RequestParam("ids") List<Long> exceptionalActivityIds) {
        log.debug("REST request to delete Exceptional Activities : {}", exceptionalActivityIds);
        exceptionalActivityServiceExt.bulkDelete(exceptionalActivityIds);
        return ResponseEntity.ok().build();
    }

    /**
     * GET  /exceptional-activities : Get Exceptional Activities by Resource ID & month.
     *
     * @param pageable           the pagination information
     * @param activityReportIdIn the list if activity report IDs
     * @param resourceId         the Resource ID
     * @param startDate          the start of month
     * @param endDate            the end of month
     * @return the ResponseEntity with status 200 (OK) and with body the exceptionalActivityDTOs
     */
    @GetMapping(value = "/exceptional-activities", params = {"override"})
    public ResponseEntity<List<ExceptionalActivityDTO>> getExceptionalActivities(
        Pageable pageable,
        @RequestParam(value = "activityReportIdIn", required = false) List<Long> activityReportIdIn,
        @RequestParam(value = "resourceId", required = false) Long resourceId,
        @RequestParam(value = "startDate", required = false) LocalDate startDate,
        @RequestParam(value = "endDate", required = false) LocalDate endDate
    ) {
        log.debug("REST request to get Exceptional Activities of resource: {}", resourceId);
        Page<ExceptionalActivityDTO> page = exceptionalActivityServiceExt.findAll(pageable, activityReportIdIn, resourceId, startDate, endDate);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/exceptional-activities");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
