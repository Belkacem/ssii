package com.zsoft.repository.extensions;

import com.zsoft.domain.ExpenseValidator;
import com.zsoft.repository.ExpenseValidatorRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the ExpenseValidator entity.
 */
@SuppressWarnings("all")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ExpenseValidatorRepositoryExt extends ExpenseValidatorRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseValidatorSecurity.checkReadPage(returnObject)")
    Page<ExpenseValidator> findAllByCompanyId(Long companyId, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseValidatorSecurity.checkReadCollection(returnObject)")
    List<ExpenseValidator> findAllByCompanyIdAndActiveIsTrue(Long companyId);

    @Nonnull
    @PreAuthorize("permitAll()")
    Optional<ExpenseValidator> findByTicket(String ticket);

    @Modifying
    @PreAuthorize("isAuthenticated()")
    @Query(value = "UPDATE expense_validator " +
        "INNER JOIN zs_user user ON user.id = ?#{principal.userId} " +
        "SET expense_validator.user_id = user.id, expense_validator.fullname = CONCAT(user.first_name, ' ', user.last_name), expense_validator.ticket = '' " +
        "WHERE expense_validator.ticket = :ticket", nativeQuery = true)
    void updateUserIdByTicket(@Param("ticket") String ticket);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @Query("select expense_validator from ExpenseValidator expense_validator where expense_validator.user.login = ?#{principal.username} and expense_validator.company.id =:companyId")
    List<ExpenseValidator> findByUserIsCurrentUserAndCompany(@Param("companyId") Long companyId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @Query("SELECT expense_validator FROM ExpenseValidator expense_validator " +
        "LEFT join User user ON user.login = ?#{principal.username} " +
        "WHERE expense_validator.ticket IS NOT NULL AND expense_validator.email=user.email AND expense_validator.user IS NULL ")
    Optional<ExpenseValidator> checkNewTickets();

}
