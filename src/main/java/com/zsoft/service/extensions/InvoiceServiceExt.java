package com.zsoft.service.extensions;

import com.google.common.base.Strings;
import com.zsoft.config.Constants;
import com.zsoft.domain.*;
import com.zsoft.domain.enumeration.InvoiceStatus;
import com.zsoft.domain.enumeration.InvoiceType;
import com.zsoft.repository.extensions.InvoiceItemRepositoryExt;
import com.zsoft.repository.extensions.InvoiceRepositoryExt;
import com.zsoft.service.dto.ConstantDTO;
import com.zsoft.service.dto.InvoiceDTO;
import com.zsoft.service.dto.InvoiceFileDTO;
import com.zsoft.service.extensions.util.AstreinteUtil;
import com.zsoft.service.extensions.util.InvoiceUtil;
import com.zsoft.service.mapper.InvoiceMapper;
import org.apache.commons.lang3.ArrayUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.nio.charset.Charset;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

/**
 * Service Implementation for managing Invoice.
 */
@Service
@Transactional
public class InvoiceServiceExt {

    private final Logger log = LoggerFactory.getLogger(InvoiceServiceExt.class);

    private final InvoiceRepositoryExt invoiceRepositoryExt;

    private final InvoiceItemRepositoryExt invoiceItemRepositoryExt;

    private final ProjectResourceInfoServiceExt projectResourceInfoServiceExt;

    private final InvoiceMapper invoiceMapper;

    private final SpringTemplateEngine templateEngine;

    private final MailServiceExt mailServiceExt;

    private final ActivityReportServiceExt activityReportServiceExt;

    private final ConstantServiceExt constantService;

    private final InvoiceFileServiceExt invoiceFileServiceExt;

    public InvoiceServiceExt(
        InvoiceRepositoryExt invoiceRepositoryExt,
        InvoiceItemRepositoryExt invoiceItemRepositoryExt,
        ProjectResourceInfoServiceExt projectResourceInfoServiceExt,
        InvoiceMapper invoiceMapper,
        SpringTemplateEngine templateEngine,
        MailServiceExt mailServiceExt,
        ActivityReportServiceExt activityReportServiceExt,
        ConstantServiceExt constantService,
        InvoiceFileServiceExt invoiceFileServiceExt
    ) {
        this.invoiceRepositoryExt = invoiceRepositoryExt;
        this.invoiceItemRepositoryExt = invoiceItemRepositoryExt;
        this.projectResourceInfoServiceExt = projectResourceInfoServiceExt;
        this.invoiceMapper = invoiceMapper;
        this.templateEngine = templateEngine;
        this.mailServiceExt = mailServiceExt;
        this.activityReportServiceExt = activityReportServiceExt;
        this.constantService = constantService;
        this.invoiceFileServiceExt = invoiceFileServiceExt;
    }

    /**
     * Create a new invoice.
     *
     * @param invoiceDTO the entity to create
     * @return the created entity
     */
    public InvoiceDTO create(InvoiceDTO invoiceDTO) {
        log.debug("Request to create Invoice : {}", invoiceDTO);
        Invoice invoice = invoiceMapper.toEntity(invoiceDTO);
        invoice = invoiceRepositoryExt.save(invoice);
        return invoiceMapper.toDto(invoice);
    }

    /**
     * Update a invoice.
     *
     * @param invoiceDTO the entity to update
     * @return the updated entity
     */
    public InvoiceDTO update(InvoiceDTO invoiceDTO, boolean sendEmail) {
        log.debug("Request to update Invoice : {}, send email: {}", invoiceDTO, sendEmail);

        Invoice invoice = invoiceMapper.toEntity(invoiceDTO);
        invoice = invoiceRepositoryExt.save(invoice);
        if (invoiceDTO.getStatus() == InvoiceStatus.SENT && sendEmail) {
            Client client = invoice.getClient();
            List<ClientContact> contacts = new ArrayList<>(client.getContacts());
            List<Attachment> files = new ArrayList<>();
            files.add(getInvoicePDF(invoice));
            List<Invoice> invoices = Collections.singletonList(invoice);
            if (client.isAttachActivityReports() && invoice.getActivityReport() != null) {
                activityReportServiceExt
                    .getActivityReportPDFById(invoice.getActivityReport().getId())
                    .ifPresent(files::add);
            }
            mailServiceExt.sendInvoiceEmail(client, invoices, contacts, files);
        }
        return invoiceMapper.toDto(invoice);
    }

    /**
     * Update invoices.
     *
     * @param invoiceDTOs the invoices list to update
     * @return the updated entity
     */
    public List<InvoiceDTO> updateBulk(List<InvoiceDTO> invoiceDTOs) {
        log.debug("Request to update Invoices : {}", invoiceDTOs);

        List<Invoice> invoices = invoiceMapper.toEntity(invoiceDTOs);
        invoices = invoiceRepositoryExt.saveAll(invoices);
        if (invoices.stream().allMatch(invoice -> invoice.getStatus() == InvoiceStatus.SENT)) {
            Client client = invoices.get(0).getClient();
            List<Attachment> files = invoices.stream().map(this::getInvoicePDF).collect(toList());
            List<ClientContact> contacts = new ArrayList<>(client.getContacts());
            if (client.isAttachActivityReports()) {
                invoices
                    .stream()
                    .filter(invoice -> invoice.getActivityReport() != null)
                    .forEach(invoice ->
                        activityReportServiceExt
                            .getActivityReportPDFById(invoice.getActivityReport().getId())
                            .ifPresent(files::add)
                    );
            }
            mailServiceExt.sendInvoiceEmail(client, invoices, contacts, files);
        }
        return invoiceMapper.toDto(invoices);
    }

    /**
     * Delete the invoice by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete Invoice : {}", id);
        invoiceRepositoryExt.findById(id)
            .ifPresent(invoice -> {
                if (invoice.getStatus() == InvoiceStatus.DRAFT) {
                    invoiceItemRepositoryExt.deleteAll(invoice.getItems());
                    invoiceRepositoryExt.deleteById(id);
                }
            });
    }

    /**
     * Delete All invoice by activity_report_id.
     *
     * @param activity_report_id the id of the activity report
     */
    public void deleteByActivityReportId(Long activity_report_id) {
        log.debug("Request to delete Invoice : {}", activity_report_id);
        invoiceRepositoryExt.findAllByActivityReport_Id(activity_report_id)
            .stream().map(Invoice::getId).forEach(this::delete);
    }

    public void sendReminder(List<Long> invoiceIdList) {
        log.debug("Request to Send Invoices Reminder by ids : {}", invoiceIdList);
        invoiceRepositoryExt.findAllWithEagerRelationships(invoiceIdList)
            .stream()
            .collect(Collectors.groupingBy(inv -> inv.getClient().getId(), TreeMap::new, toList()))
            .forEach((clientId, invoices) -> {
                Client client = invoices.get(0).getClient();
                List<ClientContact> contacts = new ArrayList<>(client.getContacts());
                List<Attachment> files = invoices.stream()
                    .map(this::getInvoicePDF)
                    .collect(toList());
                mailServiceExt.sendInvoiceReminderEmail(client, invoices, contacts, files);
            });
    }

    @Transactional(readOnly = true)
    public void sendPaymentReminders(LocalDate date) {
        List<Long> invoiceIdList = invoiceRepositoryExt
            .findAll()
            .stream()
            .filter(invoice -> invoice.getStatus() != InvoiceStatus.PAID)
            .filter(invoice -> {
                LocalDate dueDate = LocalDateTime.ofInstant(invoice.getDueDate(), ZoneId.systemDefault()).toLocalDate();
                Long untilOverDue = date.until(dueDate, ChronoUnit.DAYS);
                Long[] remindeDays = {1L, 2L, 7L, 14L};
                return ArrayUtils.contains(remindeDays, untilOverDue) || untilOverDue <= 0;
            })
            .map(Invoice::getId)
            .collect(toList());
        if (invoiceIdList.size() > 0) {
            sendReminder(invoiceIdList);
        }
    }

    /**
     * Send Invoice payment reminder email to client
     * Before 1,2,7,14 days before overdue & every day after overdue At 8:00 AM
     */
    //@Scheduled(cron = "0 0 8 * * ?")
    @Transactional(readOnly = true)
    public void sendPaymentReminders() {
        sendPaymentReminders(LocalDate.now());
    }

    public void createInvoiceTemplate(Long invoiceId) {
        invoiceRepositoryExt
            .findById(invoiceId)
            .ifPresent(invoice -> {
                String htmlTemplate = getInvoiceTemplate(invoice);
                // invoice.setFile(htmlTemplate.getBytes(Charset.forName("UTF-8")));
                // invoice.setFileContentType("text/html");
                // invoiceRepositoryExt.save(invoice);
                byte [] file = htmlTemplate.getBytes(Charset.forName("UTF-8"));
                String contentType = "text/html";
                invoiceFileServiceExt.setFile(invoiceId, file, contentType);
            });
    }

    private String getInvoiceTemplate(Invoice invoice) {
        Set<InvoiceItem> invoiceItems = invoice.getItems();
        ActivityReport activityReport = invoice.getActivityReport();
        Company company = invoice.getCompany();
        Client client = invoice.getClient();
        // create invoice pdf
        Locale locale = Locale.forLanguageTag("fr");
        Context context = new Context(locale);
        context.setVariable("invoice", invoice);
        context.setVariable("invoiceItems", invoiceItems);
        context.setVariable("company", company);
        context.setVariable("client", client);
        if (activityReport != null) {
            ProjectResource projectResource = activityReport.getProjectResource();
            LocalDate date = InvoiceUtil.toLocalDate(invoice.getIssueDate());
            Optional<ProjectResourceInfo> projectResourceInfo = projectResourceInfoServiceExt.getLastProjectResourcesInfo(projectResource, date);
            Resource resource = projectResource.getResource();
            context.setVariable("resource", resource);
            context.setVariable("projectResourceInfo", projectResourceInfo);
        }
        if (company.getLogo() != null) {
            String companyLogo = Base64Utils.encodeToString(company.getLogo());
            context.setVariable("companyLogo", companyLogo);
        }
        context.setVariable("dateFormat", "dd/MM/yyyy");
        float totalHt = 0;
        float totalTVA = 0;
        for (InvoiceItem item : invoiceItems) {
            totalHt += item.getUnitPrice() * item.getQuantity();
            totalTVA += ((item.getUnitPrice() * item.getQuantity()) * item.getTax()) / 100;
        }
        context.setVariable("totalHt", totalHt);
        context.setVariable("totalTVA", totalTVA);
        String number = InvoiceUtil.getInvoiceNumber(invoice);
        context.setVariable("number", number);

        if (!Strings.isNullOrEmpty(company.getIban())) {
            String iban = company.getIban();
            context.setVariable("iban", InvoiceUtil.formatIBAN(iban));
            String rib = company.getIban().substring(4);
            context.setVariable("rib", InvoiceUtil.formatRIB(rib));
        }
        return templateEngine.process("invoice/template", context);
    }

    public Optional<InvoiceDTO> generateInvoiceTemplate(InvoiceDTO invoiceDTO) {
        return invoiceRepositoryExt
            .findById(invoiceDTO.getId())
            .map(invoice -> {
                String htmlTemplate = getInvoiceTemplate(invoice);
                // invoice.setFile(htmlTemplate.getBytes(Charset.forName("UTF-8")));
                // invoice.setFileContentType("text/html");
                byte [] file = htmlTemplate.getBytes(Charset.forName("UTF-8"));
                String contentType = "text/html";
                invoiceFileServiceExt.setFile(invoice.getId(), file, contentType);
                return invoice;
            })
            // .map(invoiceRepositoryExt::save)
            .map(invoiceMapper::toDto);
    }

    /**
     * Get one invoice by id.
     *
     * @param id the id of the Invoice
     * @return the Invoice PDF file as Base64 encoded
     */
    public Optional<String> getInvoicePDF(Long id) {
        log.debug("Request to get Invoice PDF file : {}", id);
        return invoiceRepositoryExt
            .findById(id)
            .map(this::getInvoicePDFBytes)
            .map(bytes -> Base64.getEncoder().encodeToString(bytes));
    }

    private byte[] getInvoicePDFBytes(Invoice invoice) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setScaleToFit(true);
            Optional<InvoiceFileDTO> optionalFileDTO = invoiceFileServiceExt.getFile(invoice.getId());
            if (optionalFileDTO.isPresent()) {
                byte[] htmlTemplate = optionalFileDTO.get().getFile();
                renderer.setDocument(htmlTemplate);
                // renderer.setDocument(invoice.getFile());
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

    private Attachment getInvoicePDF(Invoice invoice) {
        String fileName = "Facture_N_" + InvoiceUtil.getInvoiceNumber(invoice) + ".pdf";
        byte[] pdfBytes = getInvoicePDFBytes(invoice);
        return new Attachment(fileName, pdfBytes);
    }

    /**
     * Get all the invoices.
     *
     * @param companyId         the id of company
     * @param projectId         the id of project
     * @param clientId          the id of client
     * @param activityReportIds the id list of activity reports
     * @param pageable          the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<InvoiceDTO> findAll(Pageable pageable, Long companyId, Long projectId, Long clientId, List<Long> activityReportIds) {
        log.debug("Request to get all Invoices by companyId: {}, projectId: {}, clientId: {}, activityReportIds: {}", companyId, projectId, clientId, activityReportIds);
        if (companyId != null) {
            return invoiceRepositoryExt.findAllByCompanyId(companyId, pageable)
                .map(invoiceMapper::toDto);
        } else if (projectId != null) {
            return invoiceRepositoryExt.findAllByProject_Id(projectId, pageable)
                .map(invoiceMapper::toDto);
        } else if (clientId != null) {
            return invoiceRepositoryExt.findAllByClientId(clientId, pageable)
                .map(invoiceMapper::toDto);
        } else if (activityReportIds != null) {
            return invoiceRepositoryExt.findAllByActivityReport_IdIn(activityReportIds, pageable)
                .map(invoiceMapper::toDto);
        } else {
            return invoiceRepositoryExt.findAll(pageable)
                .map(invoiceMapper::toDto);
        }
    }

    /**
     * Generate invoices from activity report.
     *
     * @param activity_report_id the id of the activityReport to generate
     * @return the list of generated invoices
     */
    public List<InvoiceDTO> generateInvoices(Long activity_report_id) {
        log.debug("Request to generated Invoices [Activity Report: {}, Separated: {}]", activity_report_id);
        return activityReportServiceExt
            .getActivityReportById(activity_report_id)
            .map(activityReport -> {
                ProjectResource projectResource = activityReport.getProjectResource();
                LocalDate issueDate = activityReport.getMonth().with(TemporalAdjusters.lastDayOfMonth());
                Instant issueDateInstant = InvoiceUtil.toInstant(issueDate);
                return projectResourceInfoServiceExt
                    .getLastProjectResourcesInfo(projectResource, issueDate)
                    .map(projectResourceInfo -> {
                        Set<StandardActivity> standardActivities = activityReport.getStandardActivities();
                        Set<ExceptionalActivity> exceptionalActivities = activityReport.getExceptionalActivities();
                        Project project = projectResource.getProject();
                        Client client = project.getClient();
                        if (client == null) {
                            throw new IllegalStateException("Project not have any client");
                        }
                        boolean separated = client.isSeparateInvoices();
                        Company company = project.getCompany();
                        Instant dueDate = issueDateInstant.plus(client.getPaymentDelay(), ChronoUnit.DAYS);
                        if (projectResourceInfo.getPaymentDelay() != null) {
                            dueDate = issueDateInstant.plus(projectResourceInfo.getPaymentDelay(), ChronoUnit.DAYS);
                        }
                        int nbrOfInvoices = separated && exceptionalActivities.size() > 0 && standardActivities.size() > 0 ? 2 : 1;
                        List<Invoice> invoices = new ArrayList<>();
                        for (int i = 0; i < nbrOfInvoices; i++) {
                            Invoice invoice = new Invoice()
                                .number("1")
                                .activityReport(activityReport)
                                .project(project)
                                .company(company)
                                .client(client)
                                .issueDate(issueDateInstant)
                                .dueDate(dueDate)
                                .status(InvoiceStatus.DRAFT)
                                .type(InvoiceType.INVOICE);
                            Set<InvoiceItem> invoiceItems;
                            if (separated && i == 0) {
                                if (nbrOfInvoices == 2 || exceptionalActivities.size() == 0) {
                                    invoiceItems = getInvoiceItemsByStandardActivities(invoice, standardActivities, projectResourceInfo);
                                } else {
                                    invoiceItems = getInvoiceItemsByExceptionalActivities(invoice, exceptionalActivities, projectResourceInfo);
                                }
                            } else if (separated) {
                                invoiceItems = getInvoiceItemsByExceptionalActivities(invoice, exceptionalActivities, projectResourceInfo);
                            } else {
                                invoiceItems = new HashSet<>();
                                invoiceItems.addAll(getInvoiceItemsByStandardActivities(invoice, standardActivities, projectResourceInfo));
                                invoiceItems.addAll(getInvoiceItemsByExceptionalActivities(invoice, exceptionalActivities, projectResourceInfo));
                            }
                            invoice.setItems(invoiceItems);
                            invoices.add(invoice);
                        }
                        if (invoices.size() == 0) {
                            throw new IllegalStateException("No invoice was generated");
                        }
                        return invoices.stream()
                            .map(_invoice -> {
                                Invoice invoice = invoiceRepositoryExt.save(_invoice);
                                invoiceItemRepositoryExt.saveAll(invoice.getItems());
                                return invoice;
                            })
                            .map(invoiceMapper::toDto)
                            .collect(Collectors.toList());
                    })
                    .orElseThrow(() -> new IllegalStateException("No project resource info existed in this month !"));
            })
            .orElseThrow(() -> new IllegalArgumentException("Activity report not exist !"));
    }

    private Set<InvoiceItem> getInvoiceItemsByStandardActivities(
        Invoice invoice,
        Set<StandardActivity> standardActivities,
        ProjectResourceInfo projectResourceInfo
    ) {
        Float defaultTax = constantService.getConstantByKey(Constants.DEFAULT_TVA_KEY)
            .map(ConstantDTO::getValue).map(Float::parseFloat)
            .orElse(Constants.DEFAULT_TVA);
        LocalDate date = InvoiceUtil.toLocalDate(invoice.getIssueDate());
        Float qty = standardActivities.stream()
            .map(act -> act.isMorning() && act.isAfternoon() ? 1F : (!act.isMorning() && !act.isAfternoon() ? 0F : 0.5F))
            .reduce(Float::sum).orElse(0F);
        InvoiceItem dailyBenefits = new InvoiceItem()
            .invoice(invoice)
            .name("Prestations journalières")
            .description(null)
            .date(date)
            .unitPrice(projectResourceInfo.getDailyRate())
            .tax(defaultTax)
            .quantity(qty);
        return Collections.singleton(dailyBenefits);
    }

    private Set<InvoiceItem> getInvoiceItemsByExceptionalActivities(
        Invoice invoice,
        Set<ExceptionalActivity> exceptionalActivities,
        ProjectResourceInfo projectResourceInfo
    ) {
        Float defaultTax = constantService.getConstantByKey(Constants.DEFAULT_TVA_KEY)
            .map(ConstantDTO::getValue).map(Float::parseFloat)
            .orElse(Constants.DEFAULT_TVA);
        Integer defaultHoursPerDay = constantService.getConstantByKey(Constants.HOURS_PER_DAY_KEY)
            .map(ConstantDTO::getValue).map(Integer::parseInt)
            .orElse(Constants.HOURS_PER_DAY);
        return exceptionalActivities
            .stream()
            .flatMap(exceptionalActivity ->
                AstreinteUtil.applyFactorStrategy(exceptionalActivity, projectResourceInfo.getDailyRate() / defaultHoursPerDay)
                    .stream()
            )
            .map(invoiceItem -> invoiceItem.tax(defaultTax).invoice(invoice))
            .collect(Collectors.toSet());
    }
}
