package com.zsoft.service.extensions.util;

import com.zsoft.domain.Holiday;
import com.zsoft.domain.StandardActivity;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Utility class for Full Name Strings.
 */
public final class ActivityReportUtil {

    private ActivityReportUtil() {
    }

    public static String getActivityTotal(Set<StandardActivity> standardActivities, LocalDate date) {
        double d = standardActivities.stream()
            .filter(standardActivity -> standardActivity.getDate().isEqual(date))
            .findFirst()
            .map(act -> act.isMorning() && act.isAfternoon() ? 1F : (!act.isMorning() && !act.isAfternoon() ? 0F : 0.5F))
            .orElse(0F);
        if(d == (long) d)
            return String.format("%d",(long)d);
        else
            return String.format("%s",d);
    }

    public static String getActivityTotal(Set<StandardActivity> standardActivities) {
        double d = standardActivities.stream()
            .map(act -> act.isMorning() && act.isAfternoon() ? 1F : (!act.isMorning() && !act.isAfternoon() ? 0F : 0.5F))
            .reduce(0F, (total, val) -> total + val);
        if(d == (long) d)
            return String.format("%d",(long)d);
        else
            return String.format("%s",d);
    }

    public static boolean isHoliday(LocalDate date, Set<Holiday> holidays) {
        return holidays.stream().anyMatch(holiday -> holiday.getDate().isEqual(date));
    }

    public static boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }

    public static String nbrToHours(float number) {
        long minutes = (long) (number * 60);
        long hours = TimeUnit.MINUTES.toHours(minutes);
        long remainMinutes = minutes - TimeUnit.HOURS.toMinutes(hours);
        return String.format("%02d:%02d", hours, remainMinutes);
    }
}
