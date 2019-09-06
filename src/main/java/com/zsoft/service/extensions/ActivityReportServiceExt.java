package com.zsoft.service.extensions;

import com.zsoft.domain.*;
import com.zsoft.domain.enumeration.ValidationStatus;
import com.zsoft.repository.extensions.ActivityReportRepositoryExt;
import com.zsoft.repository.extensions.HolidayRepositoryExt;
import com.zsoft.repository.extensions.ProjectResourceRepositoryExt;
import com.zsoft.security.AuthoritiesConstants;
import com.zsoft.service.UserService;
import com.zsoft.service.dto.ActivityReportDTO;
import com.zsoft.service.dto.ActivityReportFileDTO;
import com.zsoft.service.mapper.ActivityReportMapper;
import io.github.jhipster.service.QueryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.nio.charset.Charset;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.time.LocalDate.now;
import static java.time.temporal.TemporalAdjusters.firstDayOfMonth;
import static java.time.temporal.TemporalAdjusters.lastDayOfMonth;

@Service
@Transactional
public class ActivityReportServiceExt extends QueryService<ActivityReport> {

    private final Logger log = LoggerFactory.getLogger(ActivityReportServiceExt.class);

    private final ActivityReportRepositoryExt activityReportRepositoryExt;

    private final ActivityReportMapper activityReportMapper;

    private final ResourceServiceExt resourceServiceExt;

    private final ProjectResourceRepositoryExt projectResourceRepositoryExt;

    private final StandardActivityServiceExt standardActivityServiceExt;

    private final ExceptionalActivityServiceExt exceptionalActivityServiceExt;

    private final ProjectValidatorServiceExt projectValidatorServiceExt;

    private final ProjectContractorServiceExt projectContractorServiceExt;

    private final HolidayRepositoryExt holidayRepositoryExt;

    private final MailServiceExt mailServiceExt;

    private final SpringTemplateEngine templateEngine;

    private final UserService userService;

    private final ActivityReportFileServiceExt activityReportFileServiceExt;

    public ActivityReportServiceExt(
        ActivityReportRepositoryExt activityReportRepositoryExt,
        ActivityReportMapper activityReportMapper,
        ResourceServiceExt resourceServiceExt,
        ProjectResourceRepositoryExt projectResourceRepositoryExt,
        StandardActivityServiceExt standardActivityServiceExt,
        ExceptionalActivityServiceExt exceptionalActivityServiceExt,
        ProjectValidatorServiceExt projectValidatorServiceExt,
        ProjectContractorServiceExt projectContractorServiceExt,
        HolidayRepositoryExt holidayRepositoryExt,
        MailServiceExt mailServiceExt,
        SpringTemplateEngine templateEngine,
        UserService userService,
        ActivityReportFileServiceExt activityReportFileServiceExt
    ) {
        this.activityReportRepositoryExt = activityReportRepositoryExt;
        this.activityReportMapper = activityReportMapper;
        this.resourceServiceExt = resourceServiceExt;
        this.projectResourceRepositoryExt = projectResourceRepositoryExt;
        this.standardActivityServiceExt = standardActivityServiceExt;
        this.exceptionalActivityServiceExt = exceptionalActivityServiceExt;
        this.projectValidatorServiceExt = projectValidatorServiceExt;
        this.projectContractorServiceExt = projectContractorServiceExt;
        this.holidayRepositoryExt = holidayRepositoryExt;
        this.mailServiceExt = mailServiceExt;
        this.templateEngine = templateEngine;
        this.userService = userService;
        this.activityReportFileServiceExt = activityReportFileServiceExt;
    }

    /**
     * Return a {@link Page} of {@link ActivityReportDTO} which matches the criteria from the database
     *
     * @param projectResourceIds the project resource ids list
     * @param month              the month of report
     * @param page               The page, which should be returned.
     * @return the matching entities.
     */
    public Page<ActivityReportDTO> findAllReports(Pageable page, List<Long> projectResourceIds, LocalDate month) {
        log.debug("find All acitivity reports by page: {}, projectResourcesId.in: {}, month: {}", page, projectResourceIds, month);
        return userService.getUserWithAuthorities()
            .map(user -> {
                Stream<ActivityReport> reports = month != null
                    ? activityReportRepositoryExt.findAllByProjectResource_IdInAndMonth(projectResourceIds, month, page).stream()
                    : activityReportRepositoryExt.findAllByProjectResource_IdIn(projectResourceIds, page).stream();
                List<String> authorities = user.getAuthorities().stream().map(Authority::getName).collect(Collectors.toList());

                List<Long> reportsIds = reports
                    .filter(report -> {
                        StandardActivity activity = standardActivityServiceExt.getValidationStatus(report.getId());
                        return authorities.contains(AuthoritiesConstants.COMPANY_OWNER)
                            || projectValidatorServiceExt.getCurrent(report.getProjectResource().getProject().getId())
                            .map(validator -> validator.getId().equals(activity.getId()) || activity.getValidationStatus() == ValidationStatus.PENDING)
                            .orElse(true);
                    })
                    .map(ActivityReport::getId)
                    .collect(Collectors.toList());
                return activityReportRepositoryExt.findAllByIdIn(reportsIds, page)
                    .map(activityReportMapper::toDto);
            })
            .orElse(Page.empty());
    }

    /**
     * Return a {@link Page} of {@link ActivityReportDTO} which matches the criteria from the database
     *
     * @param resourceId The Id of Resource.
     * @param month      the month of report
     * @param page       The page, which should be returned.
     * @return the matching entities.
     */
    public Page<ActivityReportDTO> findAllReports(Pageable page, Long resourceId, LocalDate month) {
        log.debug("find All acitivity reports by page: {}, resourceId: {}, month: {}", page, resourceId, month);
        return activityReportRepositoryExt.findAllByProjectResource_Resource_IdAndMonth(resourceId, month, page)
            .map(activityReportMapper::toDto);
    }

    /**
     * Return a {@link Page} of {@link ActivityReportDTO} which matches the criteria from the database
     *
     * @param resourceId The Id of Resource.
     * @param page       The page, which should be returned.
     * @return the matching entities.
     */
    public Page<ActivityReportDTO> findAllReports(Pageable page, Long resourceId) {
        log.debug("find All acitivity reports by page: {}, resourceId: {}", page, resourceId);
        return activityReportRepositoryExt.findAllByProjectResource_Resource_Id(resourceId, page)
            .map(activityReportMapper::toDto);
    }

    /**
     * Return a {@link Page} of {@link ActivityReportDTO} which matches the criteria from the database
     *
     * @param month     the month of report
     * @param companyId The Id of Company.
     * @param page      The page, which should be returned.
     * @return the matching entities.
     */
    public Page<ActivityReportDTO> findAllReports(Pageable page, LocalDate month, Long companyId) {
        log.debug("find All acitivity reports by page: {}, companyId: {}, month: {}", page, companyId, month);
        return activityReportRepositoryExt.findAllByProjectResource_Resource_Company_IdAndMonth(companyId, month, page)
            .map(activityReportMapper::toDto);
    }

    /**
     * Save a activityReport.
     *
     * @param activityReportDTO the entity to save
     * @return the persisted entity
     */
    public ActivityReportDTO create(ActivityReportDTO activityReportDTO) {
        log.debug("Request to save ActivityReport : {}", activityReportDTO);
        ActivityReport activityReport = activityReportMapper.toEntity(activityReportDTO);
        activityReport = activityReportRepositoryExt.save(activityReport);
        return activityReportMapper.toDto(activityReport);
    }

    private void createActivityReport(ProjectResource projectResource, LocalDate date) {
        LocalDate month = date.withDayOfMonth(1);
        ActivityReport activityReport = new ActivityReport();
        activityReport.setMonth(month);
        activityReport.setProjectResource(projectResource);
        activityReport.setEditable(true);
        activityReport.setSubmitted(false);
        activityReport = activityReportRepositoryExt.save(activityReport);
        createHtmlTemplate(activityReport.getId());
        if (date.isAfter(date.withDayOfMonth(23))) {
            sendReminder(activityReport.getId());
        }
    }

    public void createActivityReport(LocalDate date) {
        projectResourceRepositoryExt
            .findProjectResourcesByActiveIsTrue()
            .stream()
            .filter(projectResource -> resourceServiceExt.isActive(projectResource.getResource().getId()))
            .filter(projectResource ->
                !activityReportRepositoryExt.existsActivityReportByMonthAndProjectResource_Id(date.withDayOfMonth(1), projectResource.getId())
            )
            .forEach(projectResource -> this.createActivityReport(projectResource, date));
    }

    public void createActivityReport(Long projectResourceId, List<LocalDate> months) {
        months.forEach(date -> {
            if (!activityReportRepositoryExt.existsActivityReportByMonthAndProjectResource_Id(date.withDayOfMonth(1), projectResourceId)) {
                projectResourceRepositoryExt
                    .findById(projectResourceId)
                    .ifPresent(projectResource -> {
                        if (projectResource.isActive()) {
                            this.createActivityReport(projectResource, date);
                        }
                    });
            }
        });
    }

    /**
     * Create Activity Report for each Active Project Resource on the first of month
     * Cron = 1:00 AM on 1st of every Month
     */
    @Scheduled(cron = "0 0 1 1 1/1 *")
    @Transactional
    public void createActivityReport() {
        createActivityReport(now());
    }

    /**
     * Send Notification email to Project Validator After submitting an activity report
     *
     * @param activityReportDTO the submitted activity report
     */
    private void sendSubmissionNotification(ActivityReportDTO activityReportDTO) {
        log.debug("Request to send an notification email of Submitted Activity Report : {}", activityReportDTO);
        activityReportRepositoryExt
            .findById(activityReportDTO.getId())
            .ifPresent(activityReport -> {
                Long projectId = activityReport.getProjectResource().getProject().getId();
                projectValidatorServiceExt
                    .getValidatorsByProjectId(projectId)
                    .forEach(validator -> mailServiceExt.sendReportActivitySubmitEmail(validator, activityReport));
            });
    }

    /**
     * Update an activity report.
     *
     * @param activityReportDTO the activityReportDTO to approve
     */
    @Transactional
    public ActivityReportDTO update(ActivityReportDTO activityReportDTO) {
        log.debug("Request to Update an activity report : {}", activityReportDTO);
        return Optional.ofNullable(activityReportDTO)
            .map(activityReportMapper::toEntity)
            .map(activityReportRepositoryExt::save)
            .map(activityReportMapper::toDto)
            .orElse(null);
    }

    public ActivityReportDTO sendValidationEmail(Long activityReportId) {
        return activityReportRepositoryExt
            .findById(activityReportId)
            .map(activityReport -> {
                if (activityReport.isEditable() && now().isAfter(activityReport.getMonth().with(lastDayOfMonth()))) {
                    activityReport.setEditable(false);
                    activityReportRepositoryExt.save(activityReport);
                }
                if(!activityReport.isEditable() && activityReport.isSubmitted()) {
                    StandardActivity s1 = standardActivityServiceExt.getValidationStatus(activityReport.getId());
                    ExceptionalActivity s2 = exceptionalActivityServiceExt.getValidationStatus(activityReport.getId());
                    if (s1.getValidationStatus() != ValidationStatus.PENDING && s2.getValidationStatus() != ValidationStatus.PENDING) {
                        ProjectResource projectResource = activityReport.getProjectResource();
                        Resource resource = projectResource.getResource();
                        ValidationStatus status = s1.getValidationStatus();
                        ProjectValidator validator = s1.getValidator();
                        mailServiceExt.sendReportActivityValidationEmail(activityReport, resource, validator, status);
                        projectContractorServiceExt
                            .findByProjectId(validator.getProject())
                            .forEach(projectContractor -> mailServiceExt.sendReportActivityValidationEmail(activityReport, resource, projectContractor, validator, status));
                    }
                }
                return activityReport;
            })
            .map(activityReportMapper::toDto)
            .orElse(null);
    }

    /**
     * Send first reminder email of Activity Report to all active project resources.
     * Every 23 of Month At 10:00
     */
    @Scheduled(cron = "0 0 10 23 * ?")
    @Transactional(readOnly = true)
    public void sendFirstReminderMorning() {
        sendReminder(now());
    }

    /**
     * Send first reminder email of Activity Report to all active project resources.
     * Every 23 of Month At 17:00
     */
    @Scheduled(cron = "0 0 17 23 * ?")
    @Transactional(readOnly = true)
    public void sendFirstReminderAfternoon() {
        sendReminder(now());
    }

    /**
     * Send second reminder email of Activity Report to all active project resources.
     * Every 26 of Month At 10:00
     */
    @Scheduled(cron = "0 0 10 26 * ?")
    @Transactional(readOnly = true)
    public void sendSecondReminder() {
        sendReminder(now());
    }

    /**
     * Send last reminder email of Activity Report to all active project resources.
     * Every 26, 27, 28, 29, 30, 31 of Month At 15:00
     */
    @Scheduled(cron = "0 0 15 * * ?")
    @Transactional(readOnly = true)
    public void sendLastReminders() {
        if (now().getDayOfMonth() > 26) {
            sendReminder(now());
        }
    }

    /**
     * Send reminder email of Activity Report to all active project resources.
     */
    @Transactional
    public void sendReminder(LocalDate date) {
        LocalDate today = date.with(firstDayOfMonth());
        resourceServiceExt.getAll()
            .stream()
            .filter(resource -> resourceServiceExt.isActive(resource.getId()))
            .forEach(resource ->
                activityReportRepositoryExt
                    .findByProjectResource_ResourceAndProjectResource_ActiveIsTrueAndMonthLessThanEqualAndSubmittedIsFalse(resource, today)
                    .stream()
                    .sorted(Comparator.comparing(ActivityReport::getMonth))
                    .collect(Collectors.groupingBy(ActivityReport::getMonth))
                    .forEach((month, monthReports) -> {
                        List<String> emails = monthReports
                            .stream()
                            .map(ActivityReport::getProjectResource)
                            .map(ProjectResource::getProjectEmail)
                            .distinct()
                            .collect(Collectors.toList());
                        emails.forEach(email -> mailServiceExt.sendReportActivityReminderEmail(email, resource, monthReports));
                    })
            );
    }

    /**
     * Send reminder email of Activity Report to resource.
     */
    @Transactional(readOnly = true)
    public void sendReminder(Long reportsId) {
        activityReportRepositoryExt
            .findById(reportsId)
            .ifPresent(report -> {
                List<ActivityReport> reportsList = Collections.singletonList(report);
                ProjectResource projectResource = report.getProjectResource();
                Resource resource = projectResource.getResource();
                String email = projectResource.getProjectEmail();
                mailServiceExt.sendReportActivityReminderEmail(email, resource, reportsList);
            });
    }

    @Transactional
    public void disableEditing(LocalDate date) {
        if (date.isEqual(date.with(lastDayOfMonth()))) {
            LocalDate month = date.with(firstDayOfMonth());
            activityReportRepositoryExt
                .findAllByMonthLessThanEqual(month)
                .stream()
                .filter(activityReport -> activityReport.isSubmitted() && activityReport.isEditable())
                .map(report -> report.editable(false))
                .map(activityReportRepositoryExt::save)
                .map(activityReportMapper::toDto)
                .forEach(this::sendSubmissionNotification);
        }
    }

    /**
     * Set All Submitted Activity Report as editable = false.
     * On the last day of every month At 10:00
     */
    @Scheduled(cron = "0 0 10 28-31 * ?")
    @Transactional
    public void disableEditing() {
        disableEditing(now());
    }

    private ActivityReport setHtmlFile(ActivityReport activityReport) {
        ProjectResource projectResource = activityReport.getProjectResource();
        Resource resource = projectResource.getResource();
        Project project = projectResource.getProject();
        Set<StandardActivity> standardActivities = activityReport.getStandardActivities();
        Set<ExceptionalActivity> exceptionalActivities = activityReport.getExceptionalActivities();
        List<Holiday> holidays = holidayRepositoryExt.findAll();
        List<LocalDate> dates = new ArrayList<>();
        LocalDate date = activityReport.getMonth();
        for (int i = 1; i <= date.lengthOfMonth(); i++) {
            dates.add(date.withDayOfMonth(i));
        }
        // create template
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable("activityReport", activityReport);
        context.setVariable("projectResource", projectResource);
        context.setVariable("resource", resource);
        context.setVariable("project", project);
        context.setVariable("standardActivities", standardActivities);
        context.setVariable("exceptionalActivities", exceptionalActivities);
        context.setVariable("holidays", holidays);
        context.setVariable("dates", dates);
        String htmlTemplate = templateEngine.process("activity-report/template", context);
        // save template
        byte [] file = htmlTemplate.getBytes(Charset.forName("UTF-8"));
        String contentType = "text/html";
        activityReportFileServiceExt.setFile(activityReport.getId(), file, contentType);
        return activityReport;
    }

    public void createHtmlTemplate(Long activityReportId) {
        log.debug("Request to Update an activity report html template : {}", activityReportId);
        activityReportRepositoryExt.findById(activityReportId)
            .ifPresent(activityReport -> {
                activityReport = setHtmlFile(activityReport);
                activityReportRepositoryExt.save(activityReport);
            });
    }

    private byte[] getActivityReportBytes(ActivityReport activityReport) {
        try {
            createHtmlTemplate(activityReport.getId());
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            Optional<ActivityReportFileDTO> optionalFileDTO = activityReportFileServiceExt.getFile(activityReport.getId());
            if (optionalFileDTO.isPresent()) {
                byte [] htmlTemplate = optionalFileDTO.get().getFile();
                renderer.setDocument(htmlTemplate);
                renderer.setScaleToFit(true);
                renderer.layout();
                renderer.createPDF(outputStream);
                outputStream.close();
                return outputStream.toByteArray();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Get one Activty Report by id.
     *
     * @param id the id of the Activty Report
     * @return the Activty Report PDF file as Base64 encoded
     */
    public Optional<String> getActivityReportPDF(Long id) {
        log.debug("Request to get Invoice PDF file : {}", id);
        return activityReportRepositoryExt
            .findById(id)
            .map(this::getActivityReportBytes)
            .map(bytes -> Base64.getEncoder().encodeToString(bytes));
    }

    public Optional<Attachment> getActivityReportPDFById(Long id) {
        return activityReportRepositoryExt
            .findById(id)
            .map(activityReport -> {
                ProjectResource projectResource = activityReport.getProjectResource();
                Resource resource = projectResource.getResource();
                Project project = projectResource.getProject();
                String resourceName = (resource.getFirstName() + "_" + resource.getLastName()).replace(' ', '_');
                String projectName = project.getNom().replace(' ', '_');
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
                String month = activityReport.getMonth().format(formatter).replace(' ', '_');
                String fileName = resourceName + "-" + projectName + "-" + month + ".pdf";
                byte[] pdfBytes = getActivityReportBytes(activityReport);
                return new Attachment(fileName, pdfBytes);
            });
    }

    /**
     * Get one Activty Report by id.
     *
     * @param id the id of the Activty Report
     * @return the Activty Report
     */
    public Optional<ActivityReport> getActivityReportById(Long id) {
        log.debug("Request to get Activity Report By : {}", id);
        return activityReportRepositoryExt.findById(id);
    }
}
