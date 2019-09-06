package com.zsoft.service.security;

import com.zsoft.domain.ResourceContract;
import com.zsoft.repository.extensions.ResourceContractRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ResourceContractSecurity implements EntitySecurity<ResourceContract, Long> {

    private final ResourceContractRepositoryExt resourceContractRepositoryExt;
    private ResourceSecurity resourceSecurity;

    public ResourceContractSecurity(ResourceContractRepositoryExt resourceContractRepositoryExt) {
        this.resourceContractRepositoryExt = resourceContractRepositoryExt;
    }

    @Override
    public JpaRepository<ResourceContract, Long> getRepository() {
        return this.resourceContractRepositoryExt;
    }

    @Autowired
    public void setResourceSecurity(ResourceSecurity resourceSecurity) {
        this.resourceSecurity = resourceSecurity;
    }

    @Override
    public Long getId(ResourceContract resourceContract) {
        return resourceContract.getId();
    }

    @Override
    public boolean checkRead(ResourceContract resourceContract) {
        return resourceContract.getResource() == null ?
                this.checkReadId(resourceContract.getId()) :
                this.resourceSecurity.checkRead(resourceContract.getResource());
    }

    @Override
    public boolean checkCreate(ResourceContract resourceContract) {
        return resourceContract.getResource() == null ?
                this.checkCreateId(resourceContract.getId()) :
                this.resourceSecurity.checkCreate(resourceContract.getResource());
    }

}
