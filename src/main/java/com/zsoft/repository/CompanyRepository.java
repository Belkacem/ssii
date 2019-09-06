package com.zsoft.repository;

import com.zsoft.domain.Company;
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
 * Spring Data  repository for the Company entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface CompanyRepository extends JpaRepository<Company, Long>, JpaSpecificationExecutor<Company> {

    @PreAuthorize("isAuthenticated()")
    @Query("select company from Company company where company.owner.login = ?#{principal.username}")
    List<Company> findByOwnerIsCurrentUser();

    @Nonnull
    @Override
    @PreAuthorize("@companySecurity.checkWrite(#entity)")
    <S extends Company> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@companySecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@companySecurity.checkReadCollection(returnObject)")
    List<Company> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@companySecurity.checkReadPage(returnObject)")
    Page<Company> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@companySecurity.checkReadOptional(returnObject)")
    Optional<Company> findById(@Nonnull Long id);
}
