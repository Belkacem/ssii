package com.zsoft.repository;

import com.zsoft.domain.AbsenceJustification;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;


/**
 * Spring Data  repository for the AbsenceJustification entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface AbsenceJustificationRepository extends JpaRepository<AbsenceJustification, Long> {
    @Nonnull
    @Override
    @PreAuthorize("@absenceJustificationSecurity.checkWrite(#entity)")
    <S extends AbsenceJustification> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@absenceJustificationSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceJustificationSecurity.checkReadPage(returnObject)")
    Page<AbsenceJustification> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceJustificationSecurity.checkReadOptional(returnObject)")
    Optional<AbsenceJustification> findById(@Nonnull Long id);
}
