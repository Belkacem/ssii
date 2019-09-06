package com.zsoft.service.security;

import com.zsoft.domain.AbsenceType;
import com.zsoft.repository.extensions.AbsenceTypeRepositoryExt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;

@Service
@Transactional(readOnly = true)
public class AbsenceTypeSecurity implements EntitySecurity<AbsenceType, Long> {
    private final AbsenceTypeRepositoryExt absenceTypeRepositoryExt;

    public AbsenceTypeSecurity(AbsenceTypeRepositoryExt absenceTypeRepositoryExt) {
        this.absenceTypeRepositoryExt = absenceTypeRepositoryExt;
    }

    @Override
    public JpaRepository<AbsenceType, Long> getRepository() {
        return this.absenceTypeRepositoryExt;
    }

    @Override
    public Long getId(AbsenceType absenceType) {
        return absenceType.getId();
    }

    @Override
    public boolean checkRead(AbsenceType absenceType) {
        return true;
    }

    @Override
    public boolean checkCreate(AbsenceType entity) {
        return isCurrentUserAdmin();
    }

}
