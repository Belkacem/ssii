package com.zsoft.service.security;

import com.zsoft.domain.PersistedConfiguration;
import com.zsoft.repository.extensions.PersistedConfigurationRepositoryExt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.security.SecurityUtils.getCurrentUserId;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;

@Service
@Transactional(readOnly = true)
public class PersistedConfigurationSecurity implements EntitySecurity<PersistedConfiguration, Long> {

    private final PersistedConfigurationRepositoryExt persistedConfigurationRepositoryExt;

    public PersistedConfigurationSecurity(PersistedConfigurationRepositoryExt persistedConfigurationRepositoryExt) {
        this.persistedConfigurationRepositoryExt = persistedConfigurationRepositoryExt;
    }

    @Override
    public JpaRepository<PersistedConfiguration, Long> getRepository() {
        return persistedConfigurationRepositoryExt;
    }

    @Override
    public Long getId(PersistedConfiguration persistedConfiguration) {
        return persistedConfiguration.getId();
    }

    @Override
    public boolean checkCreate(PersistedConfiguration persistedConfiguration) {
        return isCurrentUserAdmin() ||
                getCurrentUserId()
                        .map(userId -> persistedConfiguration.getUser() == null ?
                                this.checkCreateId(persistedConfiguration.getId()) :
                                userId.equals(persistedConfiguration.getUser().getId()))
                        .orElse(false);
    }

}
