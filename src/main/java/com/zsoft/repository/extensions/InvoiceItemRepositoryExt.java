package com.zsoft.repository.extensions;

import com.zsoft.domain.InvoiceItem;
import com.zsoft.repository.InvoiceItemRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;

/**
 * Spring Data  repository for the Invoice item entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface InvoiceItemRepositoryExt extends InvoiceItemRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceItemSecurity.checkReadPage(returnObject)")
    Page<InvoiceItem> findAllByInvoice_IdIn(List<Long> invoiceIds, Pageable pageable);
}
