package com.zsoft.service.extensions;

import com.zsoft.repository.extensions.ExpenseTypeRepositoryExt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service Implementation for managing ExpenseType.
 */
@Service
@Transactional
public class ExpenseTypeServiceExt {

    private final Logger log = LoggerFactory.getLogger(ExpenseTypeServiceExt.class);

    private final ExpenseTypeRepositoryExt expenseTypeRepositoryExt;

    public ExpenseTypeServiceExt(ExpenseTypeRepositoryExt expenseTypeRepositoryExt) {
        this.expenseTypeRepositoryExt = expenseTypeRepositoryExt;
    }

    /**
     * Delete the expenseType by ids list (bulk).
     *
     * @param ids the ids list
     */
    public void delete(List<Long> ids) {
        log.debug("Request to delete ExpenseType : {}", ids);
        expenseTypeRepositoryExt.deleteByIdIn(ids);
    }
}
