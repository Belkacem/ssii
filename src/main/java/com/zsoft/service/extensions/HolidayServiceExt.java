package com.zsoft.service.extensions;

import com.zsoft.repository.extensions.HolidayRepositoryExt;
import com.zsoft.service.dto.HolidayDTO;
import com.zsoft.service.mapper.HolidayMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@SuppressWarnings("ALL")
@Service
@Transactional
public class HolidayServiceExt {
    private final Logger log = LoggerFactory.getLogger(HolidayServiceExt.class);

    private final HolidayRepositoryExt holidayRepositoryExt;

    private final HolidayMapper holidayMapper;

    public HolidayServiceExt(
        HolidayRepositoryExt holidayRepositoryExt,
        HolidayMapper holidayMapper
    ) {
        this.holidayRepositoryExt = holidayRepositoryExt;
        this.holidayMapper = holidayMapper;
    }

    /**
     * Delete by ids list (bulk).
     *
     * @param ids the ids list
     */
    public void delete(List<Long> ids) {
        log.debug("Request to delete holiday : {}", ids);
        holidayRepositoryExt.deleteByIdIn(ids);
    }

    public boolean isHoliday(LocalDate date) {
        return holidayRepositoryExt
            .findAll()
            .stream()
            .anyMatch(holiday -> holiday.getDate().isEqual(date));
    }

    /**
     * Get all the holidays.
     *
     * @param pageable the pagination information
     * @param startDate date of start range
     * @param endDate   date of end range
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<HolidayDTO> findAll(Pageable pageable, LocalDate startDate, LocalDate endDate) {
        log.debug("Request to get all Holidays by startDate: {}, endDate: {}", startDate, endDate);
        if (startDate != null && endDate != null) {
            return holidayRepositoryExt.findAllByDateBetween(startDate, endDate, pageable)
                .map(holidayMapper::toDto);
        }
        return holidayRepositoryExt.findAll(pageable)
            .map(holidayMapper::toDto);
    }
}
