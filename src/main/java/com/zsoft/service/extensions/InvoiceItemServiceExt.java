package com.zsoft.service.extensions;

import com.zsoft.domain.InvoiceItem;
import com.zsoft.repository.extensions.InvoiceItemRepositoryExt;
import com.zsoft.service.dto.InvoiceItemDTO;
import com.zsoft.service.mapper.InvoiceItemMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

/**
 * Service Implementation for managing InvoiceItem.
 */
@Service
@Transactional
public class InvoiceItemServiceExt {

    private final Logger log = LoggerFactory.getLogger(InvoiceItemServiceExt.class);

    private final InvoiceItemRepositoryExt invoiceItemRepositoryExt;

    private final InvoiceServiceExt invoiceServiceExt;

    private final InvoiceItemMapper invoiceItemMapper;

    public InvoiceItemServiceExt(InvoiceItemRepositoryExt invoiceItemRepositoryExt, InvoiceServiceExt invoiceServiceExt, InvoiceItemMapper invoiceItemMapper) {
        this.invoiceItemRepositoryExt = invoiceItemRepositoryExt;
        this.invoiceServiceExt = invoiceServiceExt;
        this.invoiceItemMapper = invoiceItemMapper;
    }

    /**
     * Save a invoiceItems.
     *
     * @param invoiceItemDTOs the invoiceItemDTO list to create
     * @return the persisted entities
     */
    public List<InvoiceItemDTO> bulkSave(List<InvoiceItemDTO> invoiceItemDTOs) {
        log.debug("Request to save InvoiceItems");
        if (invoiceItemDTOs.size() > 0) {
            List<InvoiceItem> invoiceItems = invoiceItemMapper.toEntity(invoiceItemDTOs);
            invoiceItems = invoiceItemRepositoryExt.saveAll(invoiceItems);
            invoiceServiceExt.createInvoiceTemplate(invoiceItemDTOs.get(0).getInvoiceId());
            return invoiceItemMapper.toDto(invoiceItems);
        }
        return Collections.emptyList();
    }

    /**
     * Delete by ids list (bulk).
     *
     * @param ids the ids list of InvoiceItem
     */
    public void bulkDelete(List<Long> ids) {
        log.debug("Request to delete InvoiceItems : {}", ids);
        ids.forEach(invoiceItemRepositoryExt::deleteById);
    }

    /**
     * Get all the invoiceItems.
     *
     * @param invoiceIds the list of invoice ids
     * @param pageable   the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<InvoiceItemDTO> findAll(Pageable pageable, List<Long> invoiceIds) {
        log.debug("Request to get all InvoiceItems by invoiceIds: {}", invoiceIds);
        if (invoiceIds != null) {
            return invoiceItemRepositoryExt.findAllByInvoice_IdIn(invoiceIds, pageable)
                .map(invoiceItemMapper::toDto);
        }
        return invoiceItemRepositoryExt.findAll(pageable)
            .map(invoiceItemMapper::toDto);
    }
}
