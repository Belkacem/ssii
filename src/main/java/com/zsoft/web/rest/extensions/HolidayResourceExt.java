package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.HolidayDTO;
import com.zsoft.service.extensions.HolidayServiceExt;
import com.zsoft.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for managing Holiday.
 */
@RestController
@RequestMapping("/api")
public class HolidayResourceExt {
    private final Logger log = LoggerFactory.getLogger(HolidayResourceExt.class);

    private final HolidayServiceExt holidayServiceExt;

    public HolidayResourceExt(HolidayServiceExt holidayServiceExt) {
        this.holidayServiceExt = holidayServiceExt;
    }

    /**
     * DELETE  /holidays : bulk delete Holiday.
     *
     * @param ids the ids of the Holiday to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/holidays/bulk")
    public ResponseEntity<Void> bulkDelete(@RequestParam("ids") List<Long> ids) {
        log.debug("REST request to delete Holiday : {}", ids);
        holidayServiceExt.delete(ids);
        return ResponseEntity.ok().build();
    }

    /**
     * GET  /holidays : get all the holidays.
     *
     * @param pageable  the pagination information
     * @param startDate date of start range
     * @param endDate   date of end range
     * @return the ResponseEntity with status 200 (OK) and the list of holidays in body
     */
    @GetMapping(value = "/holidays", params = {"override"})
    public ResponseEntity<List<HolidayDTO>> getAllHolidays(
        Pageable pageable,
        @RequestParam(value = "startDate", required = false) LocalDate startDate,
        @RequestParam(value = "endDate", required = false) LocalDate endDate
    ) {
        log.debug("REST request to get a page of Holidays by startDate: {}, endDate: {}", startDate, endDate);
        Page<HolidayDTO> page = holidayServiceExt.findAll(pageable, startDate, endDate);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/holidays");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
