package com.zsoft.service.extensions;

import com.zsoft.repository.extensions.ExpenseJustificationRepositoryExt;
import com.zsoft.service.dto.ExpenseJustificationDTO;
import com.zsoft.service.mapper.ExpenseJustificationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing ExpenseJustification.
 */
@Service
@Transactional
public class ExpenseJustificationServiceExt {

    private final Logger log = LoggerFactory.getLogger(ExpenseJustificationServiceExt.class);

    private final ExpenseJustificationRepositoryExt expenseJustificationRepositoryExt;

    private final ExpenseJustificationMapper expenseJustificationMapper;

    public ExpenseJustificationServiceExt(
        ExpenseJustificationRepositoryExt expenseJustificationRepositoryExt,
        ExpenseJustificationMapper expenseJustificationMapper
    ) {
        this.expenseJustificationRepositoryExt = expenseJustificationRepositoryExt;
        this.expenseJustificationMapper = expenseJustificationMapper;
    }

    /**
     * Get all the expenseJustifications by expenseId.
     *
     * @param expenseId the id of expense
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public List<ExpenseJustificationDTO> findAllByExpenseId(Long expenseId) {
        log.debug("Request to get all ExpenseJustifications");
        return expenseJustificationRepositoryExt.findAllByExpense_Id(expenseId)
            .stream()
            .map(expenseJustificationMapper::toDto)
            .collect(Collectors.toList());
    }
}
