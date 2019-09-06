package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

import com.zsoft.domain.enumeration.Form;

/**
 * A Client.
 */
@Entity
@Table(name = "client")
public class Client implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Column(name = "siren", nullable = false)
    private String siren;

    @Column(name = "email")
    private String email;

    @Column(name = "tva")
    private String tva;

    @Column(name = "payment_delay")
    private Integer paymentDelay;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "form", nullable = false)
    private Form form;

    @Column(name = "address_line_1")
    private String addressLine1;

    @Column(name = "address_line_2")
    private String addressLine2;

    @Column(name = "city")
    private String city;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "country")
    private String country;

    @Column(name = "iban")
    private String iban;

    @Column(name = "bic")
    private String bic;

    @Column(name = "reference")
    private String reference;

    @Column(name = "attach_activity_reports")
    private Boolean attachActivityReports;

    @Column(name = "separate_invoices")
    private Boolean separateInvoices;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("clients")
    private Company company;

    @OneToMany(mappedBy = "client")
    private Set<ClientContact> contacts = new HashSet<>();
    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public Client name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSiren() {
        return siren;
    }

    public Client siren(String siren) {
        this.siren = siren;
        return this;
    }

    public void setSiren(String siren) {
        this.siren = siren;
    }

    public String getEmail() {
        return email;
    }

    public Client email(String email) {
        this.email = email;
        return this;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTva() {
        return tva;
    }

    public Client tva(String tva) {
        this.tva = tva;
        return this;
    }

    public void setTva(String tva) {
        this.tva = tva;
    }

    public Integer getPaymentDelay() {
        return paymentDelay;
    }

    public Client paymentDelay(Integer paymentDelay) {
        this.paymentDelay = paymentDelay;
        return this;
    }

    public void setPaymentDelay(Integer paymentDelay) {
        this.paymentDelay = paymentDelay;
    }

    public Form getForm() {
        return form;
    }

    public Client form(Form form) {
        this.form = form;
        return this;
    }

    public void setForm(Form form) {
        this.form = form;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public Client addressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
        return this;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public Client addressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
        return this;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public Client city(String city) {
        this.city = city;
        return this;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public Client postalCode(String postalCode) {
        this.postalCode = postalCode;
        return this;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public Client country(String country) {
        this.country = country;
        return this;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getIban() {
        return iban;
    }

    public Client iban(String iban) {
        this.iban = iban;
        return this;
    }

    public void setIban(String iban) {
        this.iban = iban;
    }

    public String getBic() {
        return bic;
    }

    public Client bic(String bic) {
        this.bic = bic;
        return this;
    }

    public void setBic(String bic) {
        this.bic = bic;
    }

    public String getReference() {
        return reference;
    }

    public Client reference(String reference) {
        this.reference = reference;
        return this;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public Boolean isAttachActivityReports() {
        return attachActivityReports;
    }

    public Client attachActivityReports(Boolean attachActivityReports) {
        this.attachActivityReports = attachActivityReports;
        return this;
    }

    public void setAttachActivityReports(Boolean attachActivityReports) {
        this.attachActivityReports = attachActivityReports;
    }

    public Boolean isSeparateInvoices() {
        return separateInvoices;
    }

    public Client separateInvoices(Boolean separateInvoices) {
        this.separateInvoices = separateInvoices;
        return this;
    }

    public void setSeparateInvoices(Boolean separateInvoices) {
        this.separateInvoices = separateInvoices;
    }

    public Company getCompany() {
        return company;
    }

    public Client company(Company company) {
        this.company = company;
        return this;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public Set<ClientContact> getContacts() {
        return contacts;
    }

    public Client contacts(Set<ClientContact> clientContacts) {
        this.contacts = clientContacts;
        return this;
    }

    public Client addContact(ClientContact clientContact) {
        this.contacts.add(clientContact);
        clientContact.setClient(this);
        return this;
    }

    public Client removeContact(ClientContact clientContact) {
        this.contacts.remove(clientContact);
        clientContact.setClient(null);
        return this;
    }

    public void setContacts(Set<ClientContact> clientContacts) {
        this.contacts = clientContacts;
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
        Client client = (Client) o;
        if (client.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), client.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Client{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", siren='" + getSiren() + "'" +
            ", email='" + getEmail() + "'" +
            ", tva='" + getTva() + "'" +
            ", paymentDelay=" + getPaymentDelay() +
            ", form='" + getForm() + "'" +
            ", addressLine1='" + getAddressLine1() + "'" +
            ", addressLine2='" + getAddressLine2() + "'" +
            ", city='" + getCity() + "'" +
            ", postalCode='" + getPostalCode() + "'" +
            ", country='" + getCountry() + "'" +
            ", iban='" + getIban() + "'" +
            ", bic='" + getBic() + "'" +
            ", reference='" + getReference() + "'" +
            ", attachActivityReports='" + isAttachActivityReports() + "'" +
            ", separateInvoices='" + isSeparateInvoices() + "'" +
            "}";
    }
}
