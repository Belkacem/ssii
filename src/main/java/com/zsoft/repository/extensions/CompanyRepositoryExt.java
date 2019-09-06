package com.zsoft.repository.extensions;

import com.zsoft.domain.Company;
import com.zsoft.repository.CompanyRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.jpa.repository.Query;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;


/**
 * Spring Data  repository for the Company entity.
 */
@SuppressWarnings("all")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface CompanyRepositoryExt extends CompanyRepository {

    @PreAuthorize("isAuthenticated()")
    Optional<Company> findOneBySiren(String siren);

    @PreAuthorize("permitAll()")
    Optional<Company> findOneByDomainName(String domainName);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@companySecurity.checkReadCollection(returnObject)")
    List<Company> findAllByOwnerLogin(String login);

    @PreAuthorize("isAuthenticated()")
    @Query(value = "SELECT * FROM company WHERE id IN (" +
        "SELECT company.id FROM company WHERE company.owner_id = ?#{principal.userId} " +
        "UNION SELECT company.id FROM company LEFT JOIN absence_validator ON absence_validator.company_id = company.id WHERE absence_validator.user_id = ?#{principal.userId} " +
        "UNION SELECT company.id FROM company LEFT JOIN resource ON resource.company_id = company.id WHERE resource.user_id = ?#{principal.userId} " +
        "UNION SELECT company.id FROM company LEFT JOIN project ON project.company_id = company.id LEFT JOIN project_validator ON project_validator.project_id = project.id WHERE project_validator.user_id = ?#{principal.userId} " +
        "UNION SELECT company.id FROM company LEFT JOIN project ON project.company_id = company.id LEFT JOIN project_contractor ON project_contractor.project_id = project.id WHERE project_contractor.user_id = ?#{principal.userId} " +
        "UNION SELECT company.id FROM company LEFT JOIN expense_validator ON expense_validator.company_id = company.id WHERE expense_validator.user_id = ?#{principal.userId} " +
        ")", nativeQuery = true)
    List<Company> findAllCurrentUserCompanies();
}
