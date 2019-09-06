package com.zsoft.repository.extensions;

import com.zsoft.domain.AbsenceBalance;
import com.zsoft.domain.AbsenceType;
import com.zsoft.domain.Resource;
import com.zsoft.repository.AbsenceBalanceRepository;
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
import java.util.Optional;

/**
 * Spring Data  repository for the AbsenceType entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface AbsenceBalanceRepositoryExt extends AbsenceBalanceRepository {

    @Nonnull
    @PreAuthorize("@resourceSecurity.checkRead(#resource)")
    Optional<AbsenceBalance> findByTypeAndResourceAndDateBetween(AbsenceType type, @P("resource") Resource resource, LocalDate startDate, LocalDate endDate);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceBalanceSecurity.checkReadOptional(returnObject)")
    Optional<AbsenceBalance> findByType_CodeAndResource(int typeCode, Resource resource);

    @Transactional
    @PreAuthorize("@resourceSecurity.checkCreate(#resource)")
    void deleteByResource(@Nonnull @P("resource") Resource resource);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceBalanceSecurity.checkReadPage(returnObject)")
    Page<AbsenceBalance> findAllByResource_Id(Long resourceId, Pageable pageable);
}
