package com.zsoft.service.security;

import com.zsoft.domain.InvoiceFile;
import com.zsoft.repository.extensions.InvoiceFileRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Nonnull;
import java.util.Optional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;

@Service
@Transactional(readOnly = true)
public class InvoiceFileSecurity implements EntitySecurity<InvoiceFile, Long> {

    private final InvoiceFileRepositoryExt invoiceFileRepositoryExt;
    private InvoiceSecurity invoiceSecurity;

    public InvoiceFileSecurity(InvoiceFileRepositoryExt invoiceFileRepositoryExt) {
        this.invoiceFileRepositoryExt = invoiceFileRepositoryExt;
    }

    @Override
    public JpaRepository<InvoiceFile, Long> getRepository() {
        return invoiceFileRepositoryExt;
    }

    @Autowired
    public void setInvoiceSecurity(InvoiceSecurity invoiceSecurity) {
        this.invoiceSecurity = invoiceSecurity;
    }

    @Override
    public Long getId(InvoiceFile invoiceFile) {
        return invoiceFile.getId();
    }

    @Override
    public boolean checkReadOptional(@Nonnull Optional<InvoiceFile> optionalInvoiceFile) {
        return isCurrentUserAdmin() || optionalInvoiceFile
            .map(this::checkRead)
            .orElse(true);
    }

    @Override
    public boolean checkRead(InvoiceFile invoiceFile) {
        return invoiceFile.getInvoice() == null
            ? this.checkReadId(invoiceFile.getId())
            : this.invoiceSecurity.checkRead(invoiceFile.getInvoice());
    }

    @Override
    public boolean checkCreate(InvoiceFile invoiceFile) {
        return invoiceFile.getInvoice() == null
            ? this.checkCreateId(invoiceFile.getId())
            : this.invoiceSecurity.checkCreate(invoiceFile.getInvoice());
    }

}
