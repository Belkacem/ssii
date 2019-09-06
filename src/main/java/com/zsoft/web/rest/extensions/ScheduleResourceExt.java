package com.zsoft.web.rest.extensions;

import com.zsoft.security.AuthoritiesConstants;
import com.zsoft.service.extensions.AbsenceBalanceServiceExt;
import com.zsoft.service.extensions.ActivityReportServiceExt;
import com.zsoft.service.extensions.InvoiceServiceExt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.Month;

import static java.time.temporal.TemporalAdjusters.lastDayOfMonth;

/**
 * REST controller for managing ActivityReport.
 */
@RestController
@RequestMapping("/api")
public class ScheduleResourceExt {
    private final Logger log = LoggerFactory.getLogger(ScheduleResourceExt.class);

    private final ActivityReportServiceExt activityReportServiceExt;

    private final AbsenceBalanceServiceExt balanceServiceExt;

    private final InvoiceServiceExt invoiceServiceExt;

    public ScheduleResourceExt(
        ActivityReportServiceExt activityReportServiceExt,
        AbsenceBalanceServiceExt balanceServiceExt,
        InvoiceServiceExt invoiceServiceExt
    ) {
        this.activityReportServiceExt = activityReportServiceExt;
        this.balanceServiceExt = balanceServiceExt;
        this.invoiceServiceExt = invoiceServiceExt;
    }

    @GetMapping("/schedule/activity-reports/create")
    @Secured(AuthoritiesConstants.ADMIN)
    public void createActivityReport(@RequestParam int year, @RequestParam Month month) {
        LocalDate date = LocalDate.of(year, month, 1);
        log.debug("REST request to create activity reports on {}", date);
        activityReportServiceExt.createActivityReport(date);
    }

    @GetMapping("/schedule/activity-reports/disable-editing")
    @Secured(AuthoritiesConstants.ADMIN)
    public void disableActivityReportEditing(@RequestParam int year, @RequestParam Month month) {
        LocalDate date = LocalDate.of(year, month, 1).with(lastDayOfMonth());
        log.debug("REST request to Set All Submitted Activity Report as (editable = false) on {}", date);
        activityReportServiceExt.disableEditing(date);
    }

    @GetMapping("/schedule/activity-reports/send-reminder")
    @Secured(AuthoritiesConstants.ADMIN)
    public void sendActivityReportReminder(@RequestParam LocalDate date) {
        log.debug("REST request to Send reminder email of Activity Report to all active project resources on {}", date);
        activityReportServiceExt.sendReminder(date);
    }

    @GetMapping("/schedule/absence-balances/monthly-adjust")
    @Secured(AuthoritiesConstants.ADMIN)
    public void adjustAbsenceBalances(@RequestParam int year, @RequestParam Month month) {
        LocalDate date = LocalDate.of(year, month, 1).with(lastDayOfMonth());
        log.debug("REST request to monthly adjustment of absence balances on {}", date);
        balanceServiceExt.monthlyAdjustments(date);
    }

    @GetMapping("/schedule/absence-balances/init")
    @Secured(AuthoritiesConstants.ADMIN)
    public void initAbsenceBalances(@RequestParam int year, @RequestParam Month month) {
        LocalDate date = LocalDate.of(year, month, 1);
        log.debug("REST request to yearly init absence balances on {}", date);
        balanceServiceExt.initBalances(date);
    }

    @GetMapping("/schedule/invoices/send-reminder")
    @Secured(AuthoritiesConstants.ADMIN)
    public void sendInvoicesPaymentReminders(@RequestParam LocalDate date) {
        log.debug("REST request to Send Invoice payment reminders on {}", date);
        invoiceServiceExt.sendPaymentReminders(date);
    }
}
