package com.zsoft.repository.extensions;

import com.zsoft.domain.InvoiceFile;
import com.zsoft.repository.InvoiceFileRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.Optional;

@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface InvoiceFileRepositoryExt extends InvoiceFileRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceFileSecurity.checkReadOptional(returnObject)")
    Optional<InvoiceFile> findByInvoice_Id(Long invoiceId);
}
