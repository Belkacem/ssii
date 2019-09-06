package com.zsoft.repository;

import com.zsoft.domain.AbsenceBalanceAdjustment;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;

/**
 * Spring Data  repository for the AbsenceBalanceAdjustment entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface AbsenceBalanceAdjustmentRepository extends JpaRepository<AbsenceBalanceAdjustment, Long>, JpaSpecificationExecutor<AbsenceBalanceAdjustment> {

    @Nonnull
    @Override
    @PreAuthorize("@absenceBalanceAdjustmentSecurity.checkWrite(#entity)")
    <S extends AbsenceBalanceAdjustment> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@absenceBalanceAdjustmentSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);
}
