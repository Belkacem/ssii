package com.zsoft.service.security;

import com.zsoft.domain.ProjectValidator;
import com.zsoft.repository.extensions.ProjectValidatorRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.security.SecurityUtils.getCurrentUserId;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserSystem;

@Service
@Transactional(readOnly = true)
public class ProjectValidatorSecurity implements EntitySecurity<ProjectValidator, Long> {

    private final ProjectValidatorRepositoryExt projectValidatorRepositoryExt;
    private ProjectSecurity projectSecurity;

    public ProjectValidatorSecurity(ProjectValidatorRepositoryExt projectValidatorRepositoryExt) {
        this.projectValidatorRepositoryExt = projectValidatorRepositoryExt;
    }

    @Override
    public JpaRepository<ProjectValidator, Long> getRepository() {
        return this.projectValidatorRepositoryExt;
    }

    @Autowired
    public void setProjectSecurity(ProjectSecurity projectSecurity) {
        this.projectSecurity = projectSecurity;
    }

    @Override
    public Long getId(ProjectValidator projectValidator) {
        return projectValidator.getId();
    }

    @Override
    public boolean checkCreate(ProjectValidator projectValidator) {
        return projectValidator.getProject() == null ?
            this.checkCreateId(projectValidator.getId()) :
            this.projectSecurity.checkCreate(projectValidator.getProject());
    }

    @Override
    public boolean checkRead(ProjectValidator projectValidator) {
        return isCurrentUserAdmin() || isCurrentUserSystem() ||
            (
                this.checkUpdate(projectValidator) ||
                    getCurrentUserId()
                        .map(userId -> projectValidator.getUser() == null ?
                            this.checkReadId(projectValidator.getId()) :
                            userId.equals(projectValidator.getUser().getId())
                        )
                        .orElse(false)
            );
    }
}
