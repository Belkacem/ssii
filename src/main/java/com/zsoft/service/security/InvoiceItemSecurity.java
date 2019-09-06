package com.zsoft.service.security;

import com.zsoft.domain.InvoiceItem;
import com.zsoft.repository.extensions.InvoiceItemRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class InvoiceItemSecurity implements EntitySecurity<InvoiceItem, Long> {

    private final InvoiceItemRepositoryExt invoiceItemRepositoryExt;
    private InvoiceSecurity invoiceSecurity;

    public InvoiceItemSecurity(InvoiceItemRepositoryExt invoiceItemRepositoryExt) {
        this.invoiceItemRepositoryExt = invoiceItemRepositoryExt;
    }

    @Override
    public JpaRepository<InvoiceItem, Long> getRepository() {
        return this.invoiceItemRepositoryExt;
    }

    @Autowired
    public void setInvoiceSecurity(InvoiceSecurity invoiceSecurity) {
        this.invoiceSecurity = invoiceSecurity;
    }

    @Override
    public Long getId(InvoiceItem invoiceItem) {
        return invoiceItem.getId();
    }

    @Override
    public boolean checkCreate(InvoiceItem invoiceItem) {
        return invoiceItem.getInvoice() == null ?
                checkCreateId(invoiceItem.getId()) :
                this.invoiceSecurity.checkCreate(invoiceItem.getInvoice());
    }

}
