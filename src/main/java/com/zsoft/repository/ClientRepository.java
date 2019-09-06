package com.zsoft.repository;

import com.zsoft.domain.Client;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Client entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ClientRepository extends JpaRepository<Client, Long> {
    @Nonnull
    @Override
    @PreAuthorize("@clientSecurity.checkWrite(#entity)")
    <S extends Client> S save(@Nonnull @P("entity") S entity);

    @Override
    @PreAuthorize("@clientSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@clientSecurity.checkReadCollection(returnObject)")
    List<Client> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@clientSecurity.checkReadPage(returnObject)")
    Page<Client> findAll(@Nonnull Pageable pageable);


    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@clientSecurity.checkReadOptional(returnObject)")
    Optional<Client> findById(@Nonnull Long id);
}
