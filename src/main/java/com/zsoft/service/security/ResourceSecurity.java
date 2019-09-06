package com.zsoft.service.security;

import com.zsoft.domain.ProjectResource;
import com.zsoft.domain.Resource;
import com.zsoft.repository.extensions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.security.SecurityUtils.getCurrentUserId;
import static com.zsoft.service.security.UserSecurityUtils.*;

@Service
@Transactional(readOnly = true)
public class ResourceSecurity implements EntitySecurity<Resource, Long> {

    private final ResourceRepositoryExt resourceRepositoryExt;
    private final AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt;
    private final ProjectValidatorRepositoryExt projectValidatorRepositoryExt;
    private final ProjectResourceRepositoryExt projectResourceRepositoryExt;
    private final ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt;
    private final ProjectContractorRepositoryExt projectContractorRepositoryExt;
    private CompanySecurity companySecurity;

    public ResourceSecurity(
        ResourceRepositoryExt resourceRepositoryExt,
        AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt,
        ProjectValidatorRepositoryExt projectValidatorRepositoryExt,
        ProjectResourceRepositoryExt projectResourceRepositoryExt,
        ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt,
        ProjectContractorRepositoryExt projectContractorRepositoryExt
    ) {
        this.resourceRepositoryExt = resourceRepositoryExt;
        this.absenceValidatorRepositoryExt = absenceValidatorRepositoryExt;
        this.projectValidatorRepositoryExt = projectValidatorRepositoryExt;
        this.projectResourceRepositoryExt = projectResourceRepositoryExt;
        this.expenseValidatorRepositoryExt = expenseValidatorRepositoryExt;
        this.projectContractorRepositoryExt = projectContractorRepositoryExt;
    }

    @Override
    public JpaRepository<Resource, Long> getRepository() {
        return this.resourceRepositoryExt;
    }

    @Autowired
    public void setCompanySecurity(CompanySecurity companySecurity) {
        this.companySecurity = companySecurity;
    }

    @Override
    public Long getId(Resource resource) {
        return resource.getId();
    }

    @Override
    public boolean checkRead(Resource resource) {
        return isCurrentUserAdmin()
            ||
            isCurrentUserSystem()
            ||
            this.checkUpdate(resource)
            ||
            // For absence validator right to read the resource.
            this.absenceValidatorRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .anyMatch(absenceValidator ->
                    absenceValidator
                        .getResources()
                        .stream()
                        .map(Resource::getId)
                        .anyMatch(resource.getId()::equals)
                )
            ||
            // For expense validator right to read the resource.
            (
                resource.getCompany() == null ?
                    this.checkReadId(resource.getId()) :
                    this.expenseValidatorRepositoryExt
                        .findByUserIsCurrentUser()
                        .stream()
                        .anyMatch(expenseValidator -> expenseValidator.getCompany().getId().equals(resource.getCompany().getId()))
            )
            ||
            // For project validator right to read the resource.
            this.projectValidatorRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .anyMatch(projectValidator ->
                    this.projectResourceRepositoryExt.findAllByProject_Id(projectValidator.getProject().getId())
                        .stream()
                        .map(ProjectResource::getResource)
                        .map(Resource::getId)
                        .anyMatch(resource.getId()::equals)
                )
            ||
            // For project contractor right to read the resource.
            this.projectContractorRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .anyMatch(projectContractor ->
                    this.projectResourceRepositoryExt.findAllByProject_Id(projectContractor.getProject().getId())
                        .stream()
                        .map(ProjectResource::getResource)
                        .map(Resource::getId)
                        .anyMatch(resource.getId()::equals)
                );
    }

    @Override
    public boolean checkCreate(Resource resource) {
        return resource.getCompany() == null ?
            this.checkCreateId(resource.getId()) :
            this.companySecurity.checkCreate(resource.getCompany());
    }

    @Override
    public boolean checkUpdate(Resource resource) {
        return this.checkCreate(resource) ||
            getCurrentUserId()
                .map(userId -> resource.getUser() != null && userId.equals(resource.getUser().getId()))
                .orElse(false);
    }
}
