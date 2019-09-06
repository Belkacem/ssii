package com.zsoft.repository;

import com.zsoft.domain.InvoiceFile;
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
 * Spring Data  repository for the InvoiceFile entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface InvoiceFileRepository extends JpaRepository<InvoiceFile, Long> {
    @Nonnull
    @Override
    @PreAuthorize("@invoiceFileSecurity.checkWrite(#entity)")
    <S extends InvoiceFile> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@invoiceFileSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceFileSecurity.checkReadPage(returnObject)")
    Page<InvoiceFile> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceFileSecurity.checkReadOptional(returnObject)")
    Optional<InvoiceFile> findById(@Nonnull Long id);
}
