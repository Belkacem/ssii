package com.zsoft.repository;

import com.zsoft.domain.Absence;
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
 * Spring Data  repository for the Absence entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface AbsenceRepository extends JpaRepository<Absence, Long>, JpaSpecificationExecutor<Absence> {

    @Query("select absence from Absence absence where absence.creator.login = ?#{principal.username}")
    List<Absence> findByCreatorIsCurrentUser();

    @Nonnull
    @Override
    @PreAuthorize("@absenceSecurity.checkWrite(#entity)")
    <S extends Absence> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@absenceSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceSecurity.checkReadPage(returnObject)")
    Page<Absence> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceSecurity.checkReadOptional(returnObject)")
    Optional<Absence> findById(@Nonnull Long id);
}
