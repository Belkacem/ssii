package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.InvoiceFileDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity InvoiceFile and its DTO InvoiceFileDTO.
 */
@Mapper(componentModel = "spring", uses = {InvoiceMapper.class})
public interface InvoiceFileMapper extends EntityMapper<InvoiceFileDTO, InvoiceFile> {

    @Mapping(source = "invoice.id", target = "invoiceId")
    InvoiceFileDTO toDto(InvoiceFile invoiceFile);

    @Mapping(source = "invoiceId", target = "invoice")
    InvoiceFile toEntity(InvoiceFileDTO invoiceFileDTO);

    default InvoiceFile fromId(Long id) {
        if (id == null) {
            return null;
        }
        InvoiceFile invoiceFile = new InvoiceFile();
        invoiceFile.setId(id);
        return invoiceFile;
    }
}
