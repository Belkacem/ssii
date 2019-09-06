package com.zsoft.repository;

import com.zsoft.domain.AbsenceValidator;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the AbsenceValidator entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface AbsenceValidatorRepository extends JpaRepository<AbsenceValidator, Long>, JpaSpecificationExecutor<AbsenceValidator> {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @Query("select absence_validator from AbsenceValidator absence_validator where absence_validator.user.login = ?#{principal.username}")
    List<AbsenceValidator> findByUserIsCurrentUser();

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @Query("select absence_validator from AbsenceValidator absence_validator where absence_validator.user.login = ?#{principal.username} and absence_validator.company.id =:companyId")
    List<AbsenceValidator> findByUserIsCurrentUserAndCompany(@Param("companyId") Long companyId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceValidatorSecurity.checkReadPage(returnObject)")
    @Query(value = "select distinct absence_validator from AbsenceValidator absence_validator left join fetch absence_validator.resources",
        countQuery = "select count(distinct absence_validator) from AbsenceValidator absence_validator")
    Page<AbsenceValidator> findAllWithEagerRelationships(Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceValidatorSecurity.checkReadCollection(returnObject)")
    @Query(value = "select distinct absence_validator from AbsenceValidator absence_validator left join fetch absence_validator.resources")
    List<AbsenceValidator> findAllWithEagerRelationships();

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceValidatorSecurity.checkReadOptional(returnObject)")
    @Query("select absence_validator from AbsenceValidator absence_validator left join fetch absence_validator.resources where absence_validator.id =:id")
    Optional<AbsenceValidator> findOneWithEagerRelationships(@Param("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("@absenceValidatorSecurity.checkWrite(#entity)")
    <S extends AbsenceValidator> S save(@Nonnull  @P("entity") S entity);

    @Nonnull
    @Override
    @PreAuthorize("@absenceValidatorSecurity.checkWrite(#entity)")
    <S extends AbsenceValidator> S saveAndFlush(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@absenceValidatorSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceValidatorSecurity.checkReadOptional(returnObject)")
    Optional<AbsenceValidator> findById(@Nonnull Long id);

}
