package com.zsoft.service.extensions.util;

import com.zsoft.domain.Invoice;
import com.zsoft.domain.InvoiceItem;
import com.zsoft.domain.enumeration.InvoiceType;
import org.apache.commons.lang3.StringUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Utility class for Invoices.
 */
public final class InvoiceUtil {

    private InvoiceUtil() {
    }

    public static float getTotal(Invoice invoice) {
        float total = 0;
        for (InvoiceItem item : invoice.getItems()) {
            float totalHt = item.getUnitPrice() * item.getQuantity();
            float totalTVA = ((item.getUnitPrice() * item.getQuantity()) * item.getTax()) / 100;
            total += totalHt + totalTVA;
        }
        return total;
    }

    public static String formatIBAN(String value) {
        final int length = value.length();
        final int lastPossibleBlock = length - 4;
        final StringBuilder sb = new StringBuilder(length + (length - 1) / 4);
        int i;
        for (i = 0; i < lastPossibleBlock; i += 4) {
            sb.append(value, i, i + 4);
            sb.append(' ');
        }
        sb.append(value, i, length);
        return sb.toString();
    }

    public static String formatRIB(String value) {
        return value.substring(0, 5)
            + ' ' + value.substring(5, 10)
            + ' ' + value.substring(10, 21)
            + ' ' + value.substring(21, 23);
    }

    public static String getInvoiceNumber(Invoice invoice) {
        Locale locale = Locale.forLanguageTag("fr");
        String issueDate = LocalDateTime
            .ofInstant(invoice.getIssueDate(), ZoneId.systemDefault())
            .format(DateTimeFormatter.ofPattern("yyyy-MM").withLocale(locale));
        String number = StringUtils.leftPad("" + invoice.getNumber(), 5, "0");
        if (invoice.getType() == InvoiceType.CREDIT_NOTE) {
            return "AV-" + issueDate + '-' + number;
        }
        return issueDate + '-' + number;
    }

    public static LocalDate toLocalDate(Instant date) {
        return LocalDateTime.ofInstant(date, ZoneId.systemDefault()).toLocalDate();
    }

    public static Instant toInstant(LocalDate date) {
        return date.atStartOfDay(ZoneId.systemDefault()).toInstant();
    }
}
