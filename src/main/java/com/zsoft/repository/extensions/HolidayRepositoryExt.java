package com.zsoft.repository.extensions;

import com.zsoft.domain.Holiday;
import com.zsoft.repository.HolidayRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.time.LocalDate;
import java.util.List;

/**
 * Spring Data  repository for the Holiday entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface HolidayRepositoryExt extends HolidayRepository {

    @PreAuthorize("@holidaySecurity.checkDeleteIds(#ids)")
    void deleteByIdIn(@Nonnull @P("ids") List<Long> ids);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@holidaySecurity.checkReadPage(returnObject)")
    Page<Holiday> findAllByDateBetween(@Nonnull LocalDate startDate, @Nonnull LocalDate endDate, @Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@holidaySecurity.checkReadCollection(returnObject)")
    List<Holiday> findAll();
}
