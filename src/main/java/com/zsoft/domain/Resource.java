package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

import com.zsoft.domain.enumeration.Gender;

/**
 * A Resource.
 */
@Entity
@Table(name = "resource")
public class Resource implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "identification")
    private String identification;

    @NotNull
    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "secondary_email")
    private String secondaryEmail;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "social_security")
    private String socialSecurity;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "country_of_birth")
    private String countryOfBirth;

    @Column(name = "town_of_birth")
    private String townOfBirth;

    @Column(name = "citizen_ship")
    private String citizenShip;

    @Column(name = "work_permit_type")
    private String workPermitType;

    @Column(name = "work_permit_number")
    private String workPermitNumber;

    @Column(name = "work_permit_expiry_date")
    private LocalDate workPermitExpiryDate;

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

    @Column(name = "ticket")
    private String ticket;

    @Column(name = "draft")
    private Boolean draft;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("resources")
    private Company company;

    @ManyToOne
    @JsonIgnoreProperties("resources")
    private User user;

    @ManyToMany(mappedBy = "resources")
    @JsonIgnore
    private Set<AbsenceValidator> validators = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdentification() {
        return identification;
    }

    public Resource identification(String identification) {
        this.identification = identification;
        return this;
    }

    public void setIdentification(String identification) {
        this.identification = identification;
    }

    public String getEmail() {
        return email;
    }

    public Resource email(String email) {
        this.email = email;
        return this;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSecondaryEmail() {
        return secondaryEmail;
    }

    public Resource secondaryEmail(String secondaryEmail) {
        this.secondaryEmail = secondaryEmail;
        return this;
    }

    public void setSecondaryEmail(String secondaryEmail) {
        this.secondaryEmail = secondaryEmail;
    }

    public String getFirstName() {
        return firstName;
    }

    public Resource firstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public Resource lastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Gender getGender() {
        return gender;
    }

    public Resource gender(Gender gender) {
        this.gender = gender;
        return this;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public Resource dateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
        return this;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getSocialSecurity() {
        return socialSecurity;
    }

    public Resource socialSecurity(String socialSecurity) {
        this.socialSecurity = socialSecurity;
        return this;
    }

    public void setSocialSecurity(String socialSecurity) {
        this.socialSecurity = socialSecurity;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Resource phoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
        return this;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public Resource hireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
        return this;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public String getCountryOfBirth() {
        return countryOfBirth;
    }

    public Resource countryOfBirth(String countryOfBirth) {
        this.countryOfBirth = countryOfBirth;
        return this;
    }

    public void setCountryOfBirth(String countryOfBirth) {
        this.countryOfBirth = countryOfBirth;
    }

    public String getTownOfBirth() {
        return townOfBirth;
    }

    public Resource townOfBirth(String townOfBirth) {
        this.townOfBirth = townOfBirth;
        return this;
    }

    public void setTownOfBirth(String townOfBirth) {
        this.townOfBirth = townOfBirth;
    }

    public String getCitizenShip() {
        return citizenShip;
    }

    public Resource citizenShip(String citizenShip) {
        this.citizenShip = citizenShip;
        return this;
    }

    public void setCitizenShip(String citizenShip) {
        this.citizenShip = citizenShip;
    }

    public String getWorkPermitType() {
        return workPermitType;
    }

    public Resource workPermitType(String workPermitType) {
        this.workPermitType = workPermitType;
        return this;
    }

    public void setWorkPermitType(String workPermitType) {
        this.workPermitType = workPermitType;
    }

    public String getWorkPermitNumber() {
        return workPermitNumber;
    }

    public Resource workPermitNumber(String workPermitNumber) {
        this.workPermitNumber = workPermitNumber;
        return this;
    }

    public void setWorkPermitNumber(String workPermitNumber) {
        this.workPermitNumber = workPermitNumber;
    }

    public LocalDate getWorkPermitExpiryDate() {
        return workPermitExpiryDate;
    }

    public Resource workPermitExpiryDate(LocalDate workPermitExpiryDate) {
        this.workPermitExpiryDate = workPermitExpiryDate;
        return this;
    }

    public void setWorkPermitExpiryDate(LocalDate workPermitExpiryDate) {
        this.workPermitExpiryDate = workPermitExpiryDate;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public Resource addressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
        return this;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public Resource addressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
        return this;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public Resource city(String city) {
        this.city = city;
        return this;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public Resource postalCode(String postalCode) {
        this.postalCode = postalCode;
        return this;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public Resource country(String country) {
        this.country = country;
        return this;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getTicket() {
        return ticket;
    }

    public Resource ticket(String ticket) {
        this.ticket = ticket;
        return this;
    }

    public void setTicket(String ticket) {
        this.ticket = ticket;
    }

    public Boolean isDraft() {
        return draft;
    }

    public Resource draft(Boolean draft) {
        this.draft = draft;
        return this;
    }

    public void setDraft(Boolean draft) {
        this.draft = draft;
    }

    public Company getCompany() {
        return company;
    }

    public Resource company(Company company) {
        this.company = company;
        return this;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public User getUser() {
        return user;
    }

    public Resource user(User user) {
        this.user = user;
        return this;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Set<AbsenceValidator> getValidators() {
        return validators;
    }

    public Resource validators(Set<AbsenceValidator> absenceValidators) {
        this.validators = absenceValidators;
        return this;
    }

    public Resource addValidator(AbsenceValidator absenceValidator) {
        this.validators.add(absenceValidator);
        absenceValidator.getResources().add(this);
        return this;
    }

    public Resource removeValidator(AbsenceValidator absenceValidator) {
        this.validators.remove(absenceValidator);
        absenceValidator.getResources().remove(this);
        return this;
    }

    public void setValidators(Set<AbsenceValidator> absenceValidators) {
        this.validators = absenceValidators;
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
        Resource resource = (Resource) o;
        if (resource.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), resource.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Resource{" +
            "id=" + getId() +
            ", identification='" + getIdentification() + "'" +
            ", email='" + getEmail() + "'" +
            ", secondaryEmail='" + getSecondaryEmail() + "'" +
            ", firstName='" + getFirstName() + "'" +
            ", lastName='" + getLastName() + "'" +
            ", gender='" + getGender() + "'" +
            ", dateOfBirth='" + getDateOfBirth() + "'" +
            ", socialSecurity='" + getSocialSecurity() + "'" +
            ", phoneNumber='" + getPhoneNumber() + "'" +
            ", hireDate='" + getHireDate() + "'" +
            ", countryOfBirth='" + getCountryOfBirth() + "'" +
            ", townOfBirth='" + getTownOfBirth() + "'" +
            ", citizenShip='" + getCitizenShip() + "'" +
            ", workPermitType='" + getWorkPermitType() + "'" +
            ", workPermitNumber='" + getWorkPermitNumber() + "'" +
            ", workPermitExpiryDate='" + getWorkPermitExpiryDate() + "'" +
            ", addressLine1='" + getAddressLine1() + "'" +
            ", addressLine2='" + getAddressLine2() + "'" +
            ", city='" + getCity() + "'" +
            ", postalCode='" + getPostalCode() + "'" +
            ", country='" + getCountry() + "'" +
            ", ticket='" + getTicket() + "'" +
            ", draft='" + isDraft() + "'" +
            "}";
    }
}
