package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.InvoiceDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Invoice and its DTO InvoiceDTO.
 */
@Mapper(componentModel = "spring", uses = {ProjectMapper.class, ActivityReportMapper.class, CompanyMapper.class, ClientMapper.class})
public interface InvoiceMapper extends EntityMapper<InvoiceDTO, Invoice> {

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "activityReport.id", target = "activityReportId")
    @Mapping(source = "netting.id", target = "nettingId")
    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "client.id", target = "clientId")
    InvoiceDTO toDto(Invoice invoice);

    @Mapping(source = "projectId", target = "project")
    @Mapping(source = "activityReportId", target = "activityReport")
    @Mapping(source = "nettingId", target = "netting")
    @Mapping(source = "companyId", target = "company")
    @Mapping(source = "clientId", target = "client")
    @Mapping(target = "notes", ignore = true)
    @Mapping(target = "items", ignore = true)
    Invoice toEntity(InvoiceDTO invoiceDTO);

    default Invoice fromId(Long id) {
        if (id == null) {
            return null;
        }
        Invoice invoice = new Invoice();
        invoice.setId(id);
        return invoice;
    }
}
