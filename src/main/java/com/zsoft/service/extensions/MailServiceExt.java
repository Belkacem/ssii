package com.zsoft.service.extensions;

import com.zsoft.domain.*;
import com.zsoft.domain.enumeration.ValidationStatus;
import io.github.jhipster.config.JHipsterProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for sending emails.
 * <p>
 * We use the @Async annotation to send emails asynchronously.
 */
@Service
public class MailServiceExt {

    private final Logger log = LoggerFactory.getLogger(MailServiceExt.class);

    private static final String USER = "user";

    private static final String RESOURCE = "resource";

    private static final String ABSENCE = "absence";

    private static final String ABSENCE_TYPE = "absence_type";

    private static final String ABSENCE_VALIDATOR = "absence_validator";

    private static final String PROJECT_VALIDATOR = "project_validator";

    private static final String PROJECTS = "projects";

    private static final String PROJECT = "project";

    private static final String ACTIVITY_REPORT = "activity_report";

    private static final String VALIDATION_STATUS = "validation_status";

    private static final String MONTH = "month";

    private static final String COMPANY = "company";

    private static final String CLIENT = "client";

    private static final String INVOICES = "invoices";

    private static final String EXPENSE = "expense";

    private static final String EXPENSE_TYPE = "expense_type";

    private static final String EXPENSE_VALIDATOR = "expense_validator";

    private static final String PROJECT_CONTRACTOR = "project_contractor";

    private static final String BASE_URL = "baseUrl";

    private static final String LINK = "link";

    private final JHipsterProperties jHipsterProperties;

    private final JavaMailSender javaMailSender;

    private final MessageSource messageSource;

    private final SpringTemplateEngine templateEngine;

    public MailServiceExt(JHipsterProperties jHipsterProperties, JavaMailSender javaMailSender, MessageSource messageSource, SpringTemplateEngine templateEngine) {
        this.jHipsterProperties = jHipsterProperties;
        this.javaMailSender = javaMailSender;
        this.messageSource = messageSource;
        this.templateEngine = templateEngine;
    }

    @Async
    public void sendInvitationEmail(User user) {
        log.debug("Sending Invitation email to '{}'", user.getEmail());
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        Context context = new Context(locale);
        context.setVariable(USER, user);
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/invitationResource", context);
        String subject = messageSource.getMessage("email.invitation.title", null, locale);
        sendEmail(user.getEmail(), subject, content);
    }

    @Async
    public void sendAbsenceSubmissionEmail(Absence absence, AbsenceValidator validator) {
        log.debug("Sending Absence Submission email to '{}'", validator.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(RESOURCE, absence.getResource());
        context.setVariable(ABSENCE, absence);
        context.setVariable(ABSENCE_TYPE, absence.getType());
        context.setVariable(ABSENCE_VALIDATOR, validator);
        if (validator.getUser() == null) {
            context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/signup/absences/ticket/" + validator.getTicket());
        } else {
            context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl());
        }
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/absenceSubmission", context);
        String subject = messageSource.getMessage("email.absenceSubmission.title", null, locale);
        sendEmail(validator.getEmail(), subject, content, absence.getResource().getCompany().getEmail());
    }

    @Async
    public void sendAbsenceApprovedEmail(Absence absence) {
        log.debug("Sending Absence Approved email to '{}'", absence.getResource().getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(RESOURCE, absence.getResource());
        context.setVariable(ABSENCE, absence);
        context.setVariable(ABSENCE_TYPE, absence.getType());
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/absenceApproved", context);
        String subject = messageSource.getMessage("email.absenceApproved.title", null, locale);
        sendEmail(absence.getResource().getEmail(), subject, content, absence.getResource().getCompany().getEmail());
    }

    @Async
    public void sendAbsenceRejectedEmail(Absence absence) {
        log.debug("Sending Absence Rejected email to '{}'", absence.getResource().getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(RESOURCE, absence.getResource());
        context.setVariable(ABSENCE, absence);
        context.setVariable(ABSENCE_TYPE, absence.getType());
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/absenceRejected", context);
        String subject = messageSource.getMessage("email.absenceRejected.title", null, locale);
        sendEmail(absence.getResource().getEmail(), subject, content, absence.getResource().getCompany().getEmail());
    }

    @Async
    public void sendReportActivityReminderEmail(String email, Resource resource, List<ActivityReport> reports) {
        log.debug("Sending Report Activity Reminder email to '{}'", email);
        String projects = reports
            .stream()
            .map(ActivityReport::getProjectResource)
            .map(ProjectResource::getProject)
            .map(Project::getNom)
            .collect(Collectors.joining(", "));
        Optional<ActivityReport> reportsFirst = reports.stream().findFirst();
        reportsFirst.ifPresent(report -> {
            Locale locale = Locale.forLanguageTag("fr");
            Context context = new Context(locale);
            context.setVariable(RESOURCE, resource);
            String month = report.getMonth().format(DateTimeFormatter.ofPattern("MMMM yyyy").withLocale(locale));
            String monthStr = report.getMonth().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            context.setVariable(PROJECTS, projects);
            context.setVariable(MONTH, month);
            if (resource.getUser() == null) {
                context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/signup/resources/ticket/" + resource.getTicket());
            } else {
                context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/app/resource/my-activities/" + monthStr);
            }
            context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
            String content = templateEngine.process("mail/activityReportReminder", context);
            String subject = messageSource.getMessage("email.activityReportReminder.title", null, locale);
            sendEmail(email, subject, content, resource.getCompany().getEmail());
        });
    }

    @Async
    public void sendReportActivitySubmitEmail(ProjectValidator validator, ActivityReport activityReport) {
        log.debug("Sending Activity Report has Submitted email to '{}'", validator.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        String month = activityReport.getMonth().format(DateTimeFormatter.ofPattern("MMMM yyyy").withLocale(locale));
        context.setVariable(RESOURCE, activityReport.getProjectResource().getResource());
        context.setVariable(ACTIVITY_REPORT, activityReport);
        context.setVariable(PROJECT, validator.getProject());
        context.setVariable(PROJECT_VALIDATOR, validator);
        context.setVariable(MONTH, month);
        if (validator.getUser() == null) {
            context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/signup/activity/ticket/" + validator.getTicket());
        } else {
            context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl());
        }
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/activityReportSubmit", context);
        String subject = messageSource.getMessage("email.activityReportSubmit.title", null, locale);
        sendEmail(validator.getEmail(), subject, content, validator.getProject().getCompany().getEmail());
    }

    @Async
    public void sendReportActivityValidationEmail(ActivityReport activityReport, Resource resource, ProjectValidator validator, ValidationStatus validationStatus) {
        log.debug("Sending Activity Report has Submitted email to '{}'", resource.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        String month = activityReport.getMonth().format(DateTimeFormatter.ofPattern("MMMM yyyy").withLocale(locale));
        context.setVariable(RESOURCE, resource);
        context.setVariable(PROJECT, validator.getProject());
        context.setVariable(MONTH, month);
        context.setVariable(VALIDATION_STATUS, validationStatus);
        context.setVariable(PROJECT_VALIDATOR, validator);
        context.setVariable(ACTIVITY_REPORT, activityReport);
        month = activityReport.getMonth().format(DateTimeFormatter.ofPattern("yyyy-MM").withLocale(locale));
        context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/app/resource/my-activities/" + month + "?close-menu");
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/activityReportValidation", context);
        String subject = messageSource.getMessage("email.activityReportValidation.title", null, locale);
        sendEmail(resource.getEmail(), subject, content, resource.getCompany().getEmail());
    }

    @Async
    public void sendResourceWelcomenEmail(Company company, Resource resource) {
        log.debug("Sending Resource Welcome email to '{}'", resource.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(COMPANY, company);
        context.setVariable(RESOURCE, resource);
        context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/signup/resources/ticket/" + resource.getTicket());
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/resourceWelcome", context);
        Object[] companyName = {company.getName()};
        String subject = messageSource.getMessage("email.resourceWelcome.title", companyName, locale);
        sendEmail(resource.getEmail(), subject, content);
    }

    @Async
    public void sendAbsenceValidatorWelcomeEmail(Company company, AbsenceValidator validator) {
        log.debug("Sending Absence Validator Welcome email to '{}'", validator.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(COMPANY, company);
        context.setVariable(ABSENCE_VALIDATOR, validator);
        context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/signup/absences/ticket/" + validator.getTicket());
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/absenceValidatorWelcome", context);
        Object[] companyName = {company.getName()};
        String subject = messageSource.getMessage("email.absenceValidatorWelcome.title", companyName, locale);
        sendEmail(validator.getEmail(), subject, content);
    }

    @Async
    public void sendProjectValidatorWelcomenEmail(ProjectValidator validator, Project project) {
        log.debug("Sending Project Validator Welcome email to '{}'", validator.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(PROJECT, project);
        context.setVariable(PROJECT_VALIDATOR, validator);
        context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/signup/activity/ticket/" + validator.getTicket());
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/projectValidatorWelcome", context);
        Object[] companyName = {project.getNom()};
        String subject = messageSource.getMessage("email.projectValidatorWelcome.title", companyName, locale);
        sendEmail(validator.getEmail(), subject, content);
    }

    @Async
    public void sendInvoiceEmail(Client client, List<Invoice> invoices, List<ClientContact> contacts, List<Attachment> attachments) {
        log.debug("Sending Invoice File email to '{}'", client.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(CLIENT, client);
        context.setVariable(INVOICES, invoices);
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/invoiceEmail", context);
        String subject = messageSource.getMessage("email.invoiceEmail.title", null, locale);
        List<String> bccEmails = Collections.singletonList(client.getCompany().getEmail());
        List<String> ccEmails = contacts.stream().filter(ClientContact::isActive)
            .map(ClientContact::getEmail).collect(Collectors.toList());
        sendEmail(client.getEmail(), subject, content, attachments, ccEmails, bccEmails);
    }

    @Async
    public void sendInvoiceReminderEmail(Client client, List<Invoice> invoices, List<ClientContact> contacts, List<Attachment> attachments) {
        log.debug("Sending Invoice Reminder email to '{}'", client.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(CLIENT, client);
        context.setVariable(INVOICES, invoices);
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/invoiceReminderEmail", context);
        String subject = messageSource.getMessage("email.invoiceReminderEmail.title", null, locale);
        List<String> bccEmails = Collections.singletonList(client.getCompany().getEmail());
        List<String> ccEmails = contacts.stream().filter(ClientContact::isActive)
            .map(ClientContact::getEmail).collect(Collectors.toList());
        sendEmail(client.getEmail(), subject, content, attachments, ccEmails, bccEmails);
    }

    @Async
    public void sendExpenseValidatorWelcomenEmail(Company company, ExpenseValidator validator) {
        log.debug("Sending Expense Validator Welcome email to '{}'", validator.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(COMPANY, company);
        context.setVariable(EXPENSE_VALIDATOR, validator);
        context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/signup/expenses/ticket/" + validator.getTicket());
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/expenseValidatorWelcome", context);
        Object[] companyName = {company.getName()};
        String subject = messageSource.getMessage("email.expenseValidatorWelcome.title", companyName, locale);
        sendEmail(validator.getEmail(), subject, content);
    }

    @Async
    public void sendExpenseSubmissionEmail(Expense expense, ExpenseValidator validator) {
        log.debug("Sending Expense Submission email to '{}'", validator.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(RESOURCE, expense.getResource());
        context.setVariable(EXPENSE, expense);
        context.setVariable(EXPENSE_TYPE, expense.getType());
        context.setVariable(EXPENSE_VALIDATOR, validator);
        if (validator.getUser() == null) {
            context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/signup/expenses/ticket/" + validator.getTicket());
        } else {
            context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl());
        }
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/expenseSubmission", context);
        String subject = messageSource.getMessage("email.expenseSubmission.title", null, locale);
        sendEmail(validator.getEmail(), subject, content, expense.getResource().getCompany().getEmail());
    }

    @Async
    public void sendExpenseValidationEmail(Expense expense) {
        log.debug("Sending Expense Validation email to '{}'", expense.getResource().getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(RESOURCE, expense.getResource());
        context.setVariable(EXPENSE, expense);
        context.setVariable(EXPENSE_TYPE, expense.getType());
        context.setVariable(EXPENSE_VALIDATOR, expense.getValidator());
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/expenseValidation", context);
        String subject = messageSource.getMessage("email.expenseValidation.title", null, locale);
        sendEmail(expense.getResource().getEmail(), subject, content, expense.getResource().getCompany().getEmail());
    }

    @Async
    public void sendProjectContractorWelcomeEmail(ProjectContractor contractor, Project project) {
        log.debug("Sending Project Contractor Welcome email to '{}'", contractor.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(PROJECT, project);
        context.setVariable(PROJECT_CONTRACTOR, contractor);
        context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/signup/contractor/ticket/" + contractor.getTicket());
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/projectContractorWelcome", context);
        Object[] companyName = {project.getNom()};
        String subject = messageSource.getMessage("email.projectContractorWelcome.title", companyName, locale);
        sendEmail(contractor.getEmail(), subject, content);
    }

    @Async
    public void sendReportActivityValidationEmail(ActivityReport activityReport, Resource resource, ProjectContractor contractor, ProjectValidator validator, ValidationStatus validationStatus) {
        log.debug("Sending Activity Report has Submitted email to '{}'", contractor.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        String month = activityReport.getMonth().format(DateTimeFormatter.ofPattern("MMMM yyyy").withLocale(locale));
        Project project = validator.getProject();
        context.setVariable(RESOURCE, resource);
        context.setVariable(PROJECT, project);
        context.setVariable(MONTH, month);
        context.setVariable(VALIDATION_STATUS, validationStatus);
        context.setVariable(PROJECT_VALIDATOR, validator);
        context.setVariable(PROJECT_CONTRACTOR, contractor);
        context.setVariable(ACTIVITY_REPORT, activityReport);
        context.setVariable(LINK, jHipsterProperties.getMail().getBaseUrl() + "/#/app/activities/p/" + project.getId() + "/" + activityReport.getId() + "?mode=print");
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/activityReportToContractor", context);
        String subject = messageSource.getMessage("email.activityReportToContractor.title", null, locale);
        sendEmail(contractor.getEmail(), subject, content, resource.getCompany().getEmail());
    }

    @Async
    public void sendResourceUpdates(Company company, Resource oldResource, Resource newResource, User owner) {
        log.debug("Sending email of Resource Updates to company owner email '{}'", owner.getEmail());
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable(COMPANY, company);
        context.setVariable("company_owner", owner);
        context.setVariable("new_resource", newResource);
        context.setVariable("old_resource", oldResource);
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/resourceUpdateNotification", context);
        Object[] resourceName = {newResource.getFirstName(), newResource.getLastName()};
        String subject = messageSource.getMessage("email.resourceUpdateNotification.title", resourceName, locale);
        sendEmail(owner.getEmail(), subject, content);
    }
    /**
     * SENDING EMAIL SERVICES
     */
    private void sendEmail(String to, String subject, String content) {
        sendEmail(to, subject, content, null, null, null);
    }

    private void sendEmail(String to, String subject, String content, String bcc) {
        sendEmail(to, subject, content, null, null, Collections.singletonList(bcc));
    }

    @Async
    public void sendEmail(String to, String subject, String content, List<Attachment> attachments, List<String> ccEmails, List<String> bccEmails) {
        log.debug("Send email to '{}' with subject '{}' and content={}", to, subject, content);
        try {
            System.setProperty("mail.mime.splitlongparameters", "false");
            // Prepare message using a Spring helper
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());
            message.setTo(to);
            message.setFrom(jHipsterProperties.getMail().getFrom());
            message.setSubject(subject);
            message.setText(content, true);
            if (ccEmails != null && ccEmails.size() > 0) {
                String[] emails = ccEmails.toArray(new String[ccEmails.size()]);
                message.setCc(emails);
            }
            if (bccEmails != null && bccEmails.size() > 0) {
                String[] emails = bccEmails.toArray(new String[bccEmails.size()]);
                message.setBcc(emails);
            }
            if (attachments != null && attachments.size() > 0) {
                attachments.forEach(attachment -> {
                    try {
                        String fileName = MimeUtility.encodeWord(attachment.getFilename());
                        message.addAttachment(fileName, attachment.getInputStreamSource());
                    } catch (MessagingException e) {
                        log.warn("Email could not be sent to user '{}': {}", to, e.getMessage());
                    } catch (UnsupportedEncodingException e) {
                        log.warn("File name error: {}", e.getMessage());
                    }
                });
            }
            javaMailSender.send(mimeMessage);
            log.debug("Sent email to User '{}'", to);
        } catch (Exception e) {
            if (log.isDebugEnabled()) {
                log.warn("Email could not be sent to user '{}'", to, e);
            } else {
                log.warn("Email could not be sent to user '{}': {}", to, e.getMessage());
            }
        }
    }
}
