package com.zsoft.service.security;

import com.zsoft.domain.Project;
import com.zsoft.repository.extensions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ProjectSecurity implements EntitySecurity<Project, Long> {

    private final ProjectRepositoryExt projectRepositoryExt;
    private final ProjectResourceRepositoryExt projectResourceRepositoryExt;
    private final ProjectContractorRepositoryExt projectContractorRepositoryExt;
    private final ProjectValidatorRepositoryExt projectValidatorRepositoryExt;
    private final ResourceRepositoryExt resourceRepositoryExt;
    private CompanySecurity companySecurity;
    private ProjectResourceSecurity projectResourceSecurity;

    public ProjectSecurity(ProjectRepositoryExt projectRepositoryExt,
                           ProjectResourceRepositoryExt projectResourceRepositoryExt,
                           ProjectContractorRepositoryExt projectContractorRepositoryExt,
                           ProjectValidatorRepositoryExt projectValidatorRepositoryExt,
                           ResourceRepositoryExt resourceRepositoryExt) {
        this.projectRepositoryExt = projectRepositoryExt;
        this.projectResourceRepositoryExt = projectResourceRepositoryExt;
        this.projectContractorRepositoryExt = projectContractorRepositoryExt;
        this.projectValidatorRepositoryExt = projectValidatorRepositoryExt;
        this.resourceRepositoryExt = resourceRepositoryExt;
    }

    @Override
    public JpaRepository<Project, Long> getRepository() {
        return this.projectRepositoryExt;
    }

    @Autowired
    public void setCompanySecurity(CompanySecurity companySecurity) {
        this.companySecurity = companySecurity;
    }

    @Autowired
    public void setProjectResourceSecurity(ProjectResourceSecurity projectResourceSecurity) {
        this.projectResourceSecurity = projectResourceSecurity;
    }

    @Override
    public Long getId(Project project) {
        return project.getId();
    }

    @Override
    public boolean checkRead(Project project) {
        return this.checkWrite(project)
            ||
            // For resource right to read the project.
            this.resourceRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .filter(resource -> resource.getCompany().getId().equals(project.getCompany().getId()))
                .map(resource -> this.projectResourceRepositoryExt.findByProject_IdAndResource_Id(project.getId(), resource.getId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .anyMatch(this.projectResourceSecurity::checkRead)
            ||
            // For resource right to read the project.
            this.projectResourceRepositoryExt
                .findAllByProject_Id(project.getId())
                .stream()
                .anyMatch(this.projectResourceSecurity::checkRead)
            ||
            // For project contractors right to read the project.
            this.projectContractorRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .map(projectContractor -> projectContractor.getProject().getId())
                .anyMatch(project.getId()::equals)
            ||
            // For project validator right to read the project.
            this.projectValidatorRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .map(projectValidator -> projectValidator.getProject().getId())
                .anyMatch(project.getId()::equals);
    }

    @Override
    public boolean checkCreate(Project project) {
        return project.getCompany() == null ?
            checkCreateId(project.getId()) :
            this.companySecurity.checkCreate(project.getCompany());
    }

}
