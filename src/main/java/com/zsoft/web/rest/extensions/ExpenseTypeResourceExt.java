package com.zsoft.web.rest.extensions;

import com.zsoft.service.extensions.ExpenseTypeServiceExt;
import com.zsoft.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing ExpenseType.
 */
@RestController
@RequestMapping("/api")
public class ExpenseTypeResourceExt {

    private final Logger log = LoggerFactory.getLogger(ExpenseTypeResourceExt.class);

    private static final String ENTITY_NAME = "expenseType";

    private final ExpenseTypeServiceExt expenseTypeServiceExt;

    public ExpenseTypeResourceExt(ExpenseTypeServiceExt expenseTypeServiceExt) {
        this.expenseTypeServiceExt = expenseTypeServiceExt;
    }

    /**
     * DELETE  /expense-types/bulk : bulk delete expenseType.
     *
     * @param ids the list of the expenseType ids to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/expense-types/bulk")
    public ResponseEntity<Void> bulkDeleteExpenseType(@RequestParam("ids") List<Long> ids) {
        log.debug("REST request to delete ExpenseType : {}", ids);
        expenseTypeServiceExt.delete(ids);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, ids.toString())).build();
    }
}
