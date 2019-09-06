package com.zsoft.service.security;

import com.zsoft.domain.ProjectResourceInfo;
import com.zsoft.repository.extensions.ProjectResourceInfoRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProjectResourceInfoSecurity implements EntitySecurity<ProjectResourceInfo, Long> {

    private final ProjectResourceInfoRepositoryExt projectResourceRepositoryExt;
    private ProjectResourceSecurity projectResourceSecurity;

    public ProjectResourceInfoSecurity(ProjectResourceInfoRepositoryExt projectResourceRepositoryExt) {
        this.projectResourceRepositoryExt = projectResourceRepositoryExt;
    }

    @Override
    public JpaRepository<ProjectResourceInfo, Long> getRepository() {
        return this.projectResourceRepositoryExt;
    }

    @Autowired
    public void setProjectResourceSecurity(ProjectResourceSecurity projectResourceSecurity) {
        this.projectResourceSecurity = projectResourceSecurity;
    }

    @Override
    public Long getId(ProjectResourceInfo projectResourceInfo) {
        return projectResourceInfo.getId();
    }

    @Override
    public boolean checkCreate(ProjectResourceInfo projectResourceInfo) {
        return projectResourceInfo.getProjectResource() == null ?
            this.checkCreateId(projectResourceInfo.getId()) :
            this.projectResourceSecurity.checkCreate(projectResourceInfo.getProjectResource());
    }

}
