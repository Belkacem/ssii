package com.zsoft.repository;

import com.zsoft.domain.Holiday;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.Optional;


/**
 * Spring Data  repository for the Holiday entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface HolidayRepository extends JpaRepository<Holiday, Long>, JpaSpecificationExecutor<Holiday> {

    @Nonnull
    @Override
    @PreAuthorize("@holidaySecurity.checkWrite(#entity)")
    <S extends Holiday> S save(@Nonnull @P("entity") S entity);

    @Override
    @PreAuthorize("@holidaySecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PostAuthorize("@holidaySecurity.checkReadPage(returnObject)")
    Page<Holiday> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PostAuthorize("@holidaySecurity.checkReadOptional(returnObject)")
    Optional<Holiday> findById(@Nonnull @P("id") Long id);
}
