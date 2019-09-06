package com.zsoft.service;

import com.zsoft.domain.InvoiceFile;
import com.zsoft.repository.InvoiceFileRepository;
import com.zsoft.service.dto.InvoiceFileDTO;
import com.zsoft.service.mapper.InvoiceFileMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing InvoiceFile.
 */
@Service
@Transactional
public class InvoiceFileService {

    private final Logger log = LoggerFactory.getLogger(InvoiceFileService.class);

    private final InvoiceFileRepository invoiceFileRepository;

    private final InvoiceFileMapper invoiceFileMapper;

    public InvoiceFileService(InvoiceFileRepository invoiceFileRepository, InvoiceFileMapper invoiceFileMapper) {
        this.invoiceFileRepository = invoiceFileRepository;
        this.invoiceFileMapper = invoiceFileMapper;
    }

    /**
     * Save a invoiceFile.
     *
     * @param invoiceFileDTO the entity to save
     * @return the persisted entity
     */
    public InvoiceFileDTO save(InvoiceFileDTO invoiceFileDTO) {
        log.debug("Request to save InvoiceFile : {}", invoiceFileDTO);
        InvoiceFile invoiceFile = invoiceFileMapper.toEntity(invoiceFileDTO);
        invoiceFile = invoiceFileRepository.save(invoiceFile);
        return invoiceFileMapper.toDto(invoiceFile);
    }

    /**
     * Get all the invoiceFiles.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<InvoiceFileDTO> findAll(Pageable pageable) {
        log.debug("Request to get all InvoiceFiles");
        return invoiceFileRepository.findAll(pageable)
            .map(invoiceFileMapper::toDto);
    }


    /**
     * Get one invoiceFile by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<InvoiceFileDTO> findOne(Long id) {
        log.debug("Request to get InvoiceFile : {}", id);
        return invoiceFileRepository.findById(id)
            .map(invoiceFileMapper::toDto);
    }

    /**
     * Delete the invoiceFile by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete InvoiceFile : {}", id);
        invoiceFileRepository.deleteById(id);
    }
}
