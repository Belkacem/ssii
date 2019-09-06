package com.zsoft.repository.extensions;

import com.zsoft.repository.ExpenseTypeRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;


/**
 * Spring Data  repository for the ExpenseType entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('"+ AuthoritiesConstants.ADMIN +"')")
public interface ExpenseTypeRepositoryExt extends ExpenseTypeRepository {

    @PreAuthorize("@expenseTypeSecurity.checkDeleteIds(#ids)")
    void deleteByIdIn(@Nonnull @P("ids") List<Long> ids);
}
