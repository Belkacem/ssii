package com.zsoft.service.security;

import com.zsoft.domain.ProjectContractor;
import com.zsoft.repository.extensions.ProjectContractorRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.security.SecurityUtils.getCurrentUserId;

@Service
@Transactional(readOnly = true)
public class ProjectContractorSecurity implements EntitySecurity<ProjectContractor, Long> {

    private final ProjectContractorRepositoryExt projectContractorRepositoryExt;
    private ProjectSecurity projectSecurity;

    public ProjectContractorSecurity(ProjectContractorRepositoryExt projectContractorRepositoryExt) {
        this.projectContractorRepositoryExt = projectContractorRepositoryExt;
    }

    @Override
    public JpaRepository<ProjectContractor, Long> getRepository() {
        return this.projectContractorRepositoryExt;
    }

    @Autowired
    public void setProjectSecurity(ProjectSecurity projectSecurity) {
        this.projectSecurity = projectSecurity;
    }

    @Override
    public Long getId(ProjectContractor projectContractor) {
        return projectContractor.getId();
    }

    @Override
    public boolean checkCreate(ProjectContractor projectContractor) {
        return projectContractor.getProject() == null ?
                this.checkCreateId(projectContractor.getId()) :
                this.projectSecurity.checkWrite(projectContractor.getProject());
    }

    @Override
    public boolean checkRead(ProjectContractor projectContractor) {
        return this.checkUpdate(projectContractor) ||
                getCurrentUserId()
                        .map(userId -> projectContractor.getUser() == null ?
                                this.checkReadId(projectContractor.getId()) :
                                userId.equals(projectContractor.getUser().getId())
                        )
                        .orElse(false);
    }

}
