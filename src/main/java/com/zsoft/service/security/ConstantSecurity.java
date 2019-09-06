package com.zsoft.service.security;

import com.zsoft.domain.Constant;
import com.zsoft.repository.extensions.ConstantRepositoryExt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;

@Service
@Transactional(readOnly = true)
public class ConstantSecurity implements EntitySecurity<Constant, Long> {
    private final ConstantRepositoryExt constantRepositoryExt;

    public ConstantSecurity(ConstantRepositoryExt constantRepositoryExt) {
        this.constantRepositoryExt = constantRepositoryExt;
    }

    @Override
    public JpaRepository<Constant, Long> getRepository() {
        return constantRepositoryExt;
    }

    @Override
    public Long getId(Constant constant) {
        return constant.getId();
    }

    @Override
    public boolean checkCreate(Constant persistedConfiguration) {
        return isCurrentUserAdmin();
    }

    @Override
    public boolean checkRead(Constant entity) {
        return true;
    }
}
