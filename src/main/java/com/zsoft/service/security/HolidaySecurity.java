package com.zsoft.service.security;

import com.zsoft.domain.Holiday;
import com.zsoft.repository.extensions.HolidayRepositoryExt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;

@Service
@Transactional(readOnly = true)
public class HolidaySecurity implements EntitySecurity<Holiday, Long> {
    private final HolidayRepositoryExt holidayRepositoryExt;

    public HolidaySecurity(HolidayRepositoryExt holidayRepositoryExt) {
        this.holidayRepositoryExt = holidayRepositoryExt;
    }

    @Override
    public JpaRepository<Holiday, Long> getRepository() {
        return this.holidayRepositoryExt;
    }

    @Override
    public Long getId(Holiday holiday) {
        return holiday.getId();
    }

    @Override
    public boolean checkRead(Holiday holiday) {
        return true;
    }

    @Override
    public boolean checkCreate(Holiday holiday) {
        return isCurrentUserAdmin();
    }
}
