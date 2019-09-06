package com.zsoft.repository;

import com.zsoft.domain.Constant;
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
 * Spring Data repository for the Constant entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ConstantRepository extends JpaRepository<Constant, Long> {
    @Nonnull
    @Override
    @PreAuthorize("@constantSecurity.checkWrite(#entity)")
    <S extends Constant> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@constantSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@constantSecurity.checkReadCollection(returnObject)")
    List<Constant> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@constantSecurity.checkReadPage(returnObject)")
    Page<Constant> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@constantSecurity.checkReadOptional(returnObject)")
    Optional<Constant> findById(@Nonnull Long id);
}
