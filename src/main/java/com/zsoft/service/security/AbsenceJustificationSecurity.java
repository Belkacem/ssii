package com.zsoft.service.security;

import com.zsoft.domain.AbsenceJustification;
import com.zsoft.repository.extensions.AbsenceJustificationRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AbsenceJustificationSecurity implements EntitySecurity<AbsenceJustification, Long> {

    private final AbsenceJustificationRepositoryExt absenceJustificationRepositoryExt;
    private AbsenceSecurity absenceSecurity;

    public AbsenceJustificationSecurity(AbsenceJustificationRepositoryExt absenceJustificationRepositoryExt) {
        this.absenceJustificationRepositoryExt = absenceJustificationRepositoryExt;
    }

    @Override
    public JpaRepository<AbsenceJustification, Long> getRepository() {
        return absenceJustificationRepositoryExt;
    }

    @Autowired
    public void setAbsenceSecurity(AbsenceSecurity absenceSecurity) {
        this.absenceSecurity = absenceSecurity;
    }

    @Override
    public Long getId(AbsenceJustification absenceJustification) {
        return absenceJustification.getId();
    }

    @Override
    public boolean checkRead(AbsenceJustification absenceJustification) {
        return this.absenceSecurity.checkRead(absenceJustification.getAbsence());
    }

    @Override
    public boolean checkCreate(AbsenceJustification absenceJustification) {
        return this.absenceSecurity.checkCreate(absenceJustification.getAbsence());
    }

}
