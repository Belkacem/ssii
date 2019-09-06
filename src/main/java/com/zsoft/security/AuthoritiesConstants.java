package com.zsoft.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    public static final String SYSTEM = "ROLE_SYSTEM";

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String USER = "ROLE_USER";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    public static final String COMPANY_OWNER = "ROLE_COMPANY_OWNER";

    private AuthoritiesConstants() {
    }
}
