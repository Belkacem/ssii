package com.zsoft.repository;

import com.zsoft.domain.Invoice;
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
 * Spring Data  repository for the Invoice entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

    @Nonnull
    @Override
    @PreAuthorize("@invoiceSecurity.checkWrite(#entity)")
    <S extends Invoice> S save(@Nonnull  @P("entity") S entity);

    @Nonnull
    @Override
    @PreAuthorize("@invoiceSecurity.checkCreateCollection(#entities)")
    <S extends Invoice> List<S> saveAll(@Nonnull @P("entities") Iterable<S> entities);

    @Override
    @PreAuthorize("@invoiceSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceSecurity.checkReadCollection(returnObject)")
    List<Invoice> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceSecurity.checkReadPage(returnObject)")
    Page<Invoice> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceSecurity.checkReadOptional(returnObject)")
    Optional<Invoice> findById(@Nonnull Long id);
}
