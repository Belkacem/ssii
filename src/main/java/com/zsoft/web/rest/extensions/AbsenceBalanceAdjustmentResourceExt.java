package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.AbsenceBalanceAdjustmentDTO;
import com.zsoft.service.extensions.AbsenceBalanceServiceExt;
import com.zsoft.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing AbsenceBalanceAdjustment.
 */
@RestController
@RequestMapping("/api")
public class AbsenceBalanceAdjustmentResourceExt {

    private final Logger log = LoggerFactory.getLogger(AbsenceBalanceAdjustmentResourceExt.class);

    private static final String ENTITY_NAME = "absenceBalanceAdjustment";

    private final AbsenceBalanceServiceExt absenceBalanceServiceExt;

    public AbsenceBalanceAdjustmentResourceExt(AbsenceBalanceServiceExt absenceBalanceServiceExt) {
        this.absenceBalanceServiceExt = absenceBalanceServiceExt;
    }

    /**
     * GET  /absence-balance-adjustments : get all the absenceBalanceAdjustments by absence balance ids.
     *
     * @param pageable          the pagination information
     * @param absenceBalanceIds the list of absence balance ids
     * @return the ResponseEntity with status 200 (OK) and the list of absenceBalanceAdjustments in body
     */
    @GetMapping(value = "/absence-balance-adjustments", params = {"override"})
    public ResponseEntity<List<AbsenceBalanceAdjustmentDTO>> getAllAbsenceBalanceAdjustments(
        Pageable pageable,
        @RequestParam(value = "absenceBalanceIds") List<Long> absenceBalanceIds
    ) {
        log.debug("REST request to get a page of AbsenceBalanceAdjustments by absenceBalanceIds: {}", absenceBalanceIds);
        Page<AbsenceBalanceAdjustmentDTO> page = absenceBalanceServiceExt.findAllAdjustments(pageable, absenceBalanceIds);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absence-balance-adjustments");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
