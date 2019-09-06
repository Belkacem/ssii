package com.zsoft.service.extensions;

import com.zsoft.domain.InvoiceFile;
import com.zsoft.repository.extensions.InvoiceFileRepositoryExt;
import com.zsoft.service.dto.InvoiceFileDTO;
import com.zsoft.service.mapper.InvoiceFileMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing InvoiceFile.
 */
@Service
@Transactional
public class InvoiceFileServiceExt {

    private final Logger log = LoggerFactory.getLogger(InvoiceFileServiceExt.class);

    private final InvoiceFileRepositoryExt invoiceFileRepositoryExt;

    private final InvoiceFileMapper invoiceFileMapper;

    public InvoiceFileServiceExt(InvoiceFileRepositoryExt invoiceFileRepositoryExt, InvoiceFileMapper invoiceFileMapper) {
        this.invoiceFileRepositoryExt = invoiceFileRepositoryExt;
        this.invoiceFileMapper = invoiceFileMapper;
    }

    /**
     * Set a invoiceFile to invoice.
     *
     * @param invoiceId the id of invoice
     * @return the persisted entity
     */
    public InvoiceFileDTO setFile(Long invoiceId, byte[] file, String contentType) {
        log.debug("Request to save InvoiceFile by invoiceId : {}", invoiceId);
        InvoiceFile invoiceFile = invoiceFileRepositoryExt
            .findByInvoice_Id(invoiceId)
            .orElse(new InvoiceFile());

        InvoiceFileDTO invoiceFileDTO = invoiceFileMapper.toDto(invoiceFile);
        invoiceFileDTO.setInvoiceId(invoiceId);
        invoiceFileDTO.setFile(file);
        invoiceFileDTO.setFileContentType(contentType);

        invoiceFile = invoiceFileMapper.toEntity(invoiceFileDTO);
        invoiceFile = invoiceFileRepositoryExt.save(invoiceFile);
        return invoiceFileMapper.toDto(invoiceFile);
    }


    /**
     * Get invoiceFile by invoiceId.
     *
     * @param invoiceId the id of the invoice
     * @return the invoiceFile
     */
    @Transactional(readOnly = true)
    public Optional<InvoiceFileDTO> getFile(Long invoiceId) {
        log.debug("Request to get InvoiceFile by invoiceId : {}", invoiceId);
        return invoiceFileRepositoryExt.findByInvoice_Id(invoiceId)
            .map(invoiceFileMapper::toDto);
    }
}
