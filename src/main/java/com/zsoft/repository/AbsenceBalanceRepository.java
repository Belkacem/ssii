package com.zsoft.repository;

import com.zsoft.domain.AbsenceBalance;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;


/**
 * Spring Data  repository for the AbsenceBalance entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface AbsenceBalanceRepository extends JpaRepository<AbsenceBalance, Long>, JpaSpecificationExecutor<AbsenceBalance> {

    @Nonnull
    @Override
    @PreAuthorize("@absenceBalanceSecurity.checkWrite(#entity)")
    <S extends AbsenceBalance> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@absenceBalanceSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceBalanceSecurity.checkReadCollection(returnObject)")
    List<AbsenceBalance> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceBalanceSecurity.checkReadPage(returnObject)")
    Page<AbsenceBalance> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceBalanceSecurity.checkReadOptional(returnObject)")
    Optional<AbsenceBalance> findById(@Nonnull Long id);
}
