package com.zsoft.service.security;

import com.zsoft.domain.ResourceConfiguration;
import com.zsoft.repository.ResourceConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ResourceConfigurationSecurity implements EntitySecurity<ResourceConfiguration, Long> {

    private final ResourceConfigurationRepository resourceConfigurationRepository;
    private ResourceSecurity resourceSecurity;

    public ResourceConfigurationSecurity(ResourceConfigurationRepository resourceConfigurationRepository) {
        this.resourceConfigurationRepository = resourceConfigurationRepository;
    }

    @Override
    public JpaRepository<ResourceConfiguration, Long> getRepository() {
        return this.resourceConfigurationRepository;
    }

    @Autowired
    public void setResourceSecurity(ResourceSecurity resourceSecurity) { this.resourceSecurity = resourceSecurity; }

    @Override
    public Long getId(ResourceConfiguration resourceConfiguration) {
        return resourceConfiguration.getId();
    }

    @Override
    public boolean checkCreate(ResourceConfiguration resourceConfiguration) {
        return resourceConfiguration.getResource() == null ?
            checkCreateId(resourceConfiguration.getId()) :
            this.resourceSecurity.checkCreate(resourceConfiguration.getResource());
    }

    @Override
    public boolean checkRead(ResourceConfiguration resourceConfiguration) {
        return resourceConfiguration.getResource() == null ?
            checkReadId(resourceConfiguration.getId()) :
            this.resourceSecurity.checkRead(resourceConfiguration.getResource());
    }
}
