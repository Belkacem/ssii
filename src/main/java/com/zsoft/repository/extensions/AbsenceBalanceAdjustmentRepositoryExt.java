package com.zsoft.repository.extensions;

import com.zsoft.domain.AbsenceBalance;
import com.zsoft.domain.AbsenceBalanceAdjustment;
import com.zsoft.domain.Resource;
import com.zsoft.repository.AbsenceBalanceAdjustmentRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Nonnull;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;

/**
 * Spring Data  repository for the AbsenceType entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface AbsenceBalanceAdjustmentRepositoryExt extends AbsenceBalanceAdjustmentRepository {

    @PreAuthorize("@absenceBalanceAdjustmentSecurity.checkCreate(#absenceBalance)")
    List<AbsenceBalanceAdjustment> findAllByAbsenceBalanceAndDateIsBetween(@P("absenceBalance") AbsenceBalance absenceBalance, LocalDate startDate, LocalDate endDate);

    @Transactional
    @PreAuthorize("@resourceSecurity.checkCreate(#resource)")
    void deleteByAbsenceBalance_Resource(@P("resource") Resource resource);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceBalanceAdjustmentSecurity.checkReadPage(returnObject)")
    Page<AbsenceBalanceAdjustment> findAllByAbsenceBalance_IdIn(List<Long> absenceBalanceIds, Pageable pageable);
}
