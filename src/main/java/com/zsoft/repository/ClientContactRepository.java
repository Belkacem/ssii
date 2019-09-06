package com.zsoft.repository;

import com.zsoft.domain.ClientContact;
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
 * Spring Data  repository for the ClientContact entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ClientContactRepository extends JpaRepository<ClientContact, Long> {
    @Nonnull
    @Override
    @PreAuthorize("@clientContactSecurity.checkWrite(#entity)")
    <S extends ClientContact> S save(@Nonnull @P("entity") S entity);

    @Override
    @PreAuthorize("@clientContactSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@clientContactSecurity.checkReadCollection(returnObject)")
    List<ClientContact> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@clientContactSecurity.checkReadPage(returnObject)")
    Page<ClientContact> findAll(@Nonnull Pageable pageable);


    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@clientContactSecurity.checkReadOptional(returnObject)")
    Optional<ClientContact> findById(@Nonnull Long id);
}
