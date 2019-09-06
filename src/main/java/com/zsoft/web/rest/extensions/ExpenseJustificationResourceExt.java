package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ExpenseJustificationDTO;
import com.zsoft.service.extensions.ExpenseJustificationServiceExt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing ExpenseJustification.
 */
@RestController
@RequestMapping("/api")
public class ExpenseJustificationResourceExt {

    private final Logger log = LoggerFactory.getLogger(ExpenseJustificationResourceExt.class);

    private final ExpenseJustificationServiceExt expenseJustificationServiceExt;

    public ExpenseJustificationResourceExt(ExpenseJustificationServiceExt expenseJustificationServiceExt) {
        this.expenseJustificationServiceExt = expenseJustificationServiceExt;
    }

    /**
     * GET  /expense-justifications/:expense_id : get all the ExpenseJustificaiton by expenseId.
     *
     * @param expenseId the id of the Expense
     * @return the ResponseEntity with status 200 (OK) and the list of expenseJustificationDTOs in body
     */
    @GetMapping(value = "/expense-justifications/{expense_id}", params = {"override"})
    public ResponseEntity<List<ExpenseJustificationDTO>> getAllExpenseJustifications(@PathVariable(value = "expense_id") Long expenseId) {
        log.debug("REST request to get a list of ExpenseJustification by expenseId: {}", expenseId);
        List<ExpenseJustificationDTO> expenseJustificationDTOS = expenseJustificationServiceExt.findAllByExpenseId(expenseId);
        return ResponseEntity.ok().body(expenseJustificationDTOS);
    }
}
