package com.zsoft.repository;

import com.zsoft.domain.InvoiceItem;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;


/**
 * Spring Data  repository for the InvoiceItem entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long>, JpaSpecificationExecutor<InvoiceItem> {

    @Nonnull
    @Override
    @PreAuthorize("@invoiceItemSecurity.checkWrite(#entity)")
    <S extends InvoiceItem> S save(@Nonnull @P("entity") S entity);

    @Nonnull
    @Override
    @PreAuthorize("@invoiceItemSecurity.checkCreateCollection(#entities)")
    <S extends InvoiceItem> List<S> saveAll(@Nonnull @P("entities") Iterable<S> entities);

    @Override
    @PreAuthorize("@invoiceItemSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Override
    @PreAuthorize("@invoiceItemSecurity.checkDeleteCollection(#entities)")
    void deleteAll(@Nonnull @P("entities") Iterable<? extends InvoiceItem> entities);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceItemSecurity.checkReadCollection(returnObject)")
    List<InvoiceItem> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceItemSecurity.checkReadPage(returnObject)")
    Page<InvoiceItem> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceItemSecurity.checkReadOptional(returnObject)")
    Optional<InvoiceItem> findById(@Nonnull Long id);
}
