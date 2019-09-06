package com.zsoft.repository;

import com.zsoft.domain.AbsenceType;
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
 * Spring Data  repository for the AbsenceType entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('"+ AuthoritiesConstants.ADMIN +"')")
public interface AbsenceTypeRepository extends JpaRepository<AbsenceType, Long>, JpaSpecificationExecutor<AbsenceType> {

    @Nonnull
    @Override
    @PreAuthorize("@absenceTypeSecurity.checkWrite(#entity)")
    <S extends AbsenceType> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@absenceTypeSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PostAuthorize("@absenceTypeSecurity.checkReadPage(returnObject)")
    Page<AbsenceType> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceTypeSecurity.checkReadOptional(returnObject)")
    Optional<AbsenceType> findById(@Nonnull Long id);
}
