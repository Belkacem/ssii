package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.AbsenceBalanceDTO;
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
 * REST controller for managing AbsenceBalance.
 */
@RestController
@RequestMapping("/api")
public class AbsenceBalanceResourceExt {

    private final Logger log = LoggerFactory.getLogger(AbsenceBalanceResourceExt.class);

    private final AbsenceBalanceServiceExt absenceBalanceServiceExt;

    public AbsenceBalanceResourceExt(AbsenceBalanceServiceExt absenceBalanceServiceExt) {
        this.absenceBalanceServiceExt = absenceBalanceServiceExt;
    }

    /**
     * GET  /absence-balances : get all the absenceBalances.
     *
     * @param pageable the pagination information
     * @param resourceId the absence balance resource Id
     * @return the ResponseEntity with status 200 (OK) and the list of absenceBalances in body
     */
    @GetMapping(value = "/absence-balances", params = {"override"})
    public ResponseEntity<List<AbsenceBalanceDTO>> getAllAbsenceBalances(
        Pageable pageable,
        @RequestParam(value = "resourceId") Long resourceId
    ) {
        log.debug("REST request to get a page of AbsenceBalances by resourceId: {}", resourceId);
        Page<AbsenceBalanceDTO> page = absenceBalanceServiceExt.findAll(pageable, resourceId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absence-balances");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
