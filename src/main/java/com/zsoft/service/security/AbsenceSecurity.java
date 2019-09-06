package com.zsoft.service.security;

import com.zsoft.domain.Absence;
import com.zsoft.repository.extensions.AbsenceRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AbsenceSecurity implements EntitySecurity<Absence, Long> {

    private final AbsenceRepositoryExt absenceRepositoryExt;
    private ResourceSecurity resourceSecurity;

    public AbsenceSecurity(AbsenceRepositoryExt absenceRepositoryExt) {
        this.absenceRepositoryExt = absenceRepositoryExt;
    }

    @Override
    public JpaRepository<Absence, Long> getRepository() {
        return absenceRepositoryExt;
    }

    @Autowired
    public void setResourceSecurity(ResourceSecurity resourceSecurity) {
        this.resourceSecurity = resourceSecurity;
    }

    @Override
    public Long getId(Absence absence) {
        return absence.getId();
    }

    @Override
    public boolean checkRead(Absence absence) {
        return absence.getResource() == null
            ? this.checkReadId(absence.getId())
            : this.resourceSecurity.checkRead(absence.getResource());
    }

    @Override
    public boolean checkUpdate(Absence absence) {
        return this.checkRead(absence);
    }

    @Override
    public boolean checkCreate(Absence absence) {
        return absence.getResource() == null
            ? this.checkCreateId(absence.getId())
            : this.resourceSecurity.checkUpdateId(absence.getResource().getId());
    }

}
