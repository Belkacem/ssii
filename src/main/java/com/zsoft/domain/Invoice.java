package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

import com.zsoft.domain.enumeration.InvoiceType;

import com.zsoft.domain.enumeration.InvoiceStatus;

/**
 * A Invoice.
 */
@Entity
@Table(name = "invoice")
public class Invoice implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "zs_number", nullable = false)
    private String number;

    @NotNull
    @Column(name = "issue_date", nullable = false)
    private Instant issueDate;

    @NotNull
    @Column(name = "due_date", nullable = false)
    private Instant dueDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "zs_type", nullable = false)
    private InvoiceType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InvoiceStatus status;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @ManyToOne
    @JsonIgnoreProperties("invoices")
    private Project project;

    @ManyToOne
    @JsonIgnoreProperties("invoices")
    private ActivityReport activityReport;

    @ManyToOne
    @JsonIgnoreProperties("notes")
    private Invoice netting;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("invoices")
    private Company company;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("invoices")
    private Client client;

    @OneToMany(mappedBy = "netting")
    private Set<Invoice> notes = new HashSet<>();
    @OneToMany(mappedBy = "invoice")
    private Set<InvoiceItem> items = new HashSet<>();
    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumber() {
        return number;
    }

    public Invoice number(String number) {
        this.number = number;
        return this;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public Instant getIssueDate() {
        return issueDate;
    }

    public Invoice issueDate(Instant issueDate) {
        this.issueDate = issueDate;
        return this;
    }

    public void setIssueDate(Instant issueDate) {
        this.issueDate = issueDate;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public Invoice dueDate(Instant dueDate) {
        this.dueDate = dueDate;
        return this;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public InvoiceType getType() {
        return type;
    }

    public Invoice type(InvoiceType type) {
        this.type = type;
        return this;
    }

    public void setType(InvoiceType type) {
        this.type = type;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public Invoice status(InvoiceStatus status) {
        this.status = status;
        return this;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public Invoice paymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
        return this;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public Project getProject() {
        return project;
    }

    public Invoice project(Project project) {
        this.project = project;
        return this;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public ActivityReport getActivityReport() {
        return activityReport;
    }

    public Invoice activityReport(ActivityReport activityReport) {
        this.activityReport = activityReport;
        return this;
    }

    public void setActivityReport(ActivityReport activityReport) {
        this.activityReport = activityReport;
    }

    public Invoice getNetting() {
        return netting;
    }

    public Invoice netting(Invoice invoice) {
        this.netting = invoice;
        return this;
    }

    public void setNetting(Invoice invoice) {
        this.netting = invoice;
    }

    public Company getCompany() {
        return company;
    }

    public Invoice company(Company company) {
        this.company = company;
        return this;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public Client getClient() {
        return client;
    }

    public Invoice client(Client client) {
        this.client = client;
        return this;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Set<Invoice> getNotes() {
        return notes;
    }

    public Invoice notes(Set<Invoice> invoices) {
        this.notes = invoices;
        return this;
    }

    public Invoice addNote(Invoice invoice) {
        this.notes.add(invoice);
        invoice.setNetting(this);
        return this;
    }

    public Invoice removeNote(Invoice invoice) {
        this.notes.remove(invoice);
        invoice.setNetting(null);
        return this;
    }

    public void setNotes(Set<Invoice> invoices) {
        this.notes = invoices;
    }

    public Set<InvoiceItem> getItems() {
        return items;
    }

    public Invoice items(Set<InvoiceItem> invoiceItems) {
        this.items = invoiceItems;
        return this;
    }

    public Invoice addItem(InvoiceItem invoiceItem) {
        this.items.add(invoiceItem);
        invoiceItem.setInvoice(this);
        return this;
    }

    public Invoice removeItem(InvoiceItem invoiceItem) {
        this.items.remove(invoiceItem);
        invoiceItem.setInvoice(null);
        return this;
    }

    public void setItems(Set<InvoiceItem> invoiceItems) {
        this.items = invoiceItems;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Invoice invoice = (Invoice) o;
        if (invoice.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), invoice.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Invoice{" +
            "id=" + getId() +
            ", number='" + getNumber() + "'" +
            ", issueDate='" + getIssueDate() + "'" +
            ", dueDate='" + getDueDate() + "'" +
            ", type='" + getType() + "'" +
            ", status='" + getStatus() + "'" +
            ", paymentDate='" + getPaymentDate() + "'" +
            "}";
    }
}
