package com.zsoft.service.security;

import com.zsoft.domain.Invoice;
import com.zsoft.repository.extensions.InvoiceRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserSystem;

@Service
@Transactional(readOnly = true)
public class InvoiceSecurity implements EntitySecurity<Invoice, Long> {

    private final InvoiceRepositoryExt invoiceRepositoryExt;
    private CompanySecurity companySecurity;

    public InvoiceSecurity(InvoiceRepositoryExt invoiceRepositoryExt) {
        this.invoiceRepositoryExt = invoiceRepositoryExt;
    }

    @Override
    public JpaRepository<Invoice, Long> getRepository() {
        return this.invoiceRepositoryExt;
    }

    @Autowired
    public void setCompanySecurity(CompanySecurity companySecurity) {
        this.companySecurity = companySecurity;
    }

    @Override
    public Long getId(Invoice invoice) {
        return invoice.getId();
    }

    @Override
    public boolean checkRead(Invoice entity) {
        return isCurrentUserAdmin() || isCurrentUserSystem() || this.checkUpdate(entity);
    }

    @Override
    public boolean checkCreate(Invoice invoice) {
        return isCurrentUserAdmin() || invoice.getCompany() == null ?
            checkCreateId(invoice.getId()) :
            this.companySecurity.checkCreate(invoice.getCompany());
    }

}
