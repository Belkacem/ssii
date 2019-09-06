package com.zsoft.service.security;

import com.zsoft.domain.ProjectResource;
import com.zsoft.repository.extensions.ProjectContractorRepositoryExt;
import com.zsoft.repository.extensions.ProjectResourceRepositoryExt;
import com.zsoft.repository.extensions.ProjectValidatorRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserSystem;

@Service
@Transactional(readOnly = true)
public class ProjectResourceSecurity implements EntitySecurity<ProjectResource, Long> {

    private final ProjectResourceRepositoryExt projectResourceRepositoryExt;
    private final ProjectValidatorRepositoryExt projectValidatorRepositoryExt;
    private final ProjectContractorRepositoryExt projectContractorRepositoryExt;
    private ResourceSecurity resourceSecurity;
    private ProjectSecurity projectSecurity;

    public ProjectResourceSecurity(
        ProjectResourceRepositoryExt projectResourceRepositoryExt,
        ProjectValidatorRepositoryExt projectValidatorRepositoryExt,
        ProjectContractorRepositoryExt projectContractorRepositoryExt
    ) {
        this.projectResourceRepositoryExt = projectResourceRepositoryExt;
        this.projectValidatorRepositoryExt = projectValidatorRepositoryExt;
        this.projectContractorRepositoryExt = projectContractorRepositoryExt;
    }

    @Override
    public JpaRepository<ProjectResource, Long> getRepository() {
        return this.projectResourceRepositoryExt;
    }

    @Autowired
    public void setResourceSecurity(ResourceSecurity resourceSecurity) {
        this.resourceSecurity = resourceSecurity;
    }

    @Autowired
    public void setProjectSecurity(ProjectSecurity projectSecurity) {
        this.projectSecurity = projectSecurity;
    }

    @Override
    public Long getId(ProjectResource projectResource) {
        return projectResource.getId();
    }

    @Override
    public boolean checkCreate(ProjectResource projectResource) {
        return isCurrentUserAdmin() ||
            (
                projectResource.getProject() == null ?
                    this.checkCreateId(projectResource.getId()) :
                    this.projectSecurity.checkCreate(projectResource.getProject())
            );
    }

    @Override
    public boolean checkRead(ProjectResource projectResource) {
        return isCurrentUserAdmin() || isCurrentUserSystem() ||
            (
                projectResource.getProject() == null ?
                    this.checkReadId(projectResource.getId()) : (
                    (
                        this.projectValidatorRepositoryExt
                            .findByUserIsCurrentUser()
                            .stream()
                            .anyMatch(projectValidator -> projectValidator.getProject().getId().equals(projectResource.getProject().getId()))
                    ) || (
                        this.projectContractorRepositoryExt
                            .findByUserIsCurrentUser()
                            .stream()
                            .anyMatch(projectContractor -> projectContractor.getProject().getId().equals(projectResource.getProject().getId()))
                    ) || (
                        this.resourceSecurity.checkRead(projectResource.getResource())
                    )
                )
            );
    }
}
