package com.zsoft.service.extensions.util;

/**
 * Utility class for Full Name Strings.
 */
public final class FullNameUtil {

    private FullNameUtil() {
    }

    /**
     * get FirstName from FullName.
     *
     * @return the first name
     */
    public static String getFirstName(String fullName) {
        String[] fullName_split = fullName.split(" ");
        return fullName_split[0];
    }

    /**
     * get LastName from FullName.
     *
     * @return the last name
     */
    public static String getLastName(String fullName) {
        String[] fullName_split = fullName.split(" ");
        String firstName = fullName_split[0];
        return fullName.substring(firstName.length() + 1);
    }
}
