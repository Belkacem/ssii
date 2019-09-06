package com.zsoft.repository;

import com.zsoft.domain.ActivityReport;
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
 * Spring Data  repository for the ActivityReport entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ActivityReportRepository extends JpaRepository<ActivityReport, Long>, JpaSpecificationExecutor<ActivityReport> {

    @Nonnull
    @Override
    @PreAuthorize("@activityReportSecurity.checkWrite(#entity)")
    <S extends ActivityReport> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@activityReportSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("@activityReportSecurity.checkCreateCollection(#entities)")
    <S extends ActivityReport> List<S> saveAll(@Nonnull @P("entities") Iterable<S> entities);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadCollection(returnObject)")
    List<ActivityReport> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadPage(returnObject)")
    Page<ActivityReport> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadOptional(returnObject)")
    Optional<ActivityReport> findById(@Nonnull Long id);
}
