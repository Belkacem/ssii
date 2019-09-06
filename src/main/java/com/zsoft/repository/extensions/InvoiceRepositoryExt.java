package com.zsoft.repository.extensions;

import com.zsoft.domain.Invoice;
import com.zsoft.repository.InvoiceRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;


/**
 * Spring Data  repository for the Invoice entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface InvoiceRepositoryExt extends InvoiceRepository {
    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceSecurity.checkReadCollection(returnObject)")
    @Query("select distinct invoice from Invoice invoice left join fetch invoice.items where invoice.id in :ids")
    List<Invoice> findAllWithEagerRelationships(@Nonnull @Param("ids") List<Long> invoiceIdList);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceSecurity.checkReadPage(returnObject)")
    Page<Invoice> findAllByCompanyId(Long companyId, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceSecurity.checkReadPage(returnObject)")
    Page<Invoice> findAllByProject_Id(Long projectId, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceSecurity.checkReadPage(returnObject)")
    Page<Invoice> findAllByClientId(Long clientId, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceSecurity.checkReadPage(returnObject)")
    Page<Invoice> findAllByActivityReport_IdIn(List<Long> activityReportIds, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@invoiceSecurity.checkReadCollection(returnObject)")
    List<Invoice> findAllByActivityReport_Id(Long activityReportIds);
}
