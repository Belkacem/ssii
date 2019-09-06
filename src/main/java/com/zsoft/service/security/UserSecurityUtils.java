package com.zsoft.service.security;

import com.zsoft.security.AuthoritiesConstants;
import com.zsoft.security.CustomUser;
import org.springframework.security.core.context.SecurityContext;

import java.util.Optional;

import static com.zsoft.security.SecurityUtils.isCurrentUserInRole;
import static org.springframework.security.core.context.SecurityContextHolder.getContext;

public class UserSecurityUtils {

    public static Optional<CustomUser> getCurrentUser() {
        SecurityContext securityContext = getContext();
        return Optional.ofNullable(securityContext.getAuthentication())
            .map(authentication -> {
                if (authentication.getPrincipal() instanceof CustomUser) {
                    return (CustomUser) authentication.getPrincipal();
                }
                return null;
            });
    }

    public static boolean isCurrentUserAdmin() {
        return isCurrentUserInRole(AuthoritiesConstants.ADMIN);
    }

    public static boolean isCurrentUserSystem() {
        return isCurrentUserInRole(AuthoritiesConstants.SYSTEM);
    }

    public static boolean isCurrentUserCompanyOwner() {
        return isCurrentUserInRole(AuthoritiesConstants.COMPANY_OWNER);
    }

}
