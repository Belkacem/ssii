package com.zsoft.domain;



import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.util.Objects;

/**
 * A ActivityReportFile.
 */
@Entity
@Table(name = "activity_report_file")
public class ActivityReportFile implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "zs_file")
    private byte[] file;

    @Column(name = "zs_file_content_type")
    private String fileContentType;

    @OneToOne(optional = false)    @NotNull

    @JoinColumn(unique = true)
    private ActivityReport activityReport;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getFile() {
        return file;
    }

    public ActivityReportFile file(byte[] file) {
        this.file = file;
        return this;
    }

    public void setFile(byte[] file) {
        this.file = file;
    }

    public String getFileContentType() {
        return fileContentType;
    }

    public ActivityReportFile fileContentType(String fileContentType) {
        this.fileContentType = fileContentType;
        return this;
    }

    public void setFileContentType(String fileContentType) {
        this.fileContentType = fileContentType;
    }

    public ActivityReport getActivityReport() {
        return activityReport;
    }

    public ActivityReportFile activityReport(ActivityReport activityReport) {
        this.activityReport = activityReport;
        return this;
    }

    public void setActivityReport(ActivityReport activityReport) {
        this.activityReport = activityReport;
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
        ActivityReportFile activityReportFile = (ActivityReportFile) o;
        if (activityReportFile.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), activityReportFile.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ActivityReportFile{" +
            "id=" + getId() +
            ", file='" + getFile() + "'" +
            ", fileContentType='" + getFileContentType() + "'" +
            "}";
    }
}
