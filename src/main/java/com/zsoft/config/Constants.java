package com.zsoft.config;

/**
 * Application constants.
 */
public final class Constants {

    // Regex for acceptable logins
    public static final String LOGIN_REGEX = "^[_.@A-Za-z0-9-]*$";

    public static final String SYSTEM_ACCOUNT = "system";
    public static final String ANONYMOUS_USER = "anonymoususer";
    public static final String DEFAULT_LANGUAGE = "fr";

    public static final Integer DEFAULT_CP = 25;
    public static final Integer DEFAULT_RTT = 8;

    public static final Float DEFAULT_TVA = 20F;
    public static final Integer HOURS_PER_DAY = 8;

    public static final String DEFAULT_TVA_KEY = "DEFAULT_TVA";
    public static final String HOURS_PER_DAY_KEY = "HOURS_PER_DAY";

    public static final String AUTOMATIC_ADJUSTMENT_COMMENT =
        "Adjustment automatic of balance by absence";

    private Constants() {
    }
}
