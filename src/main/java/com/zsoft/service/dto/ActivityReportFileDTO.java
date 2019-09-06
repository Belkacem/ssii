package com.zsoft.service.dto;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
import javax.persistence.Lob;

/**
 * A DTO for the ActivityReportFile entity.
 */
public class ActivityReportFileDTO implements Serializable {

    private Long id;

    @Lob
    private byte[] file;

    private String fileContentType;

    private Long activityReportId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getFile() {
        return file;
    }

    public void setFile(byte[] file) {
        this.file = file;
    }

    public String getFileContentType() {
        return fileContentType;
    }

    public void setFileContentType(String fileContentType) {
        this.fileContentType = fileContentType;
    }

    public Long getActivityReportId() {
        return activityReportId;
    }

    public void setActivityReportId(Long activityReportId) {
        this.activityReportId = activityReportId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ActivityReportFileDTO activityReportFileDTO = (ActivityReportFileDTO) o;
        if (activityReportFileDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), activityReportFileDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ActivityReportFileDTO{" +
            "id=" + getId() +
            ", file='" + getFile() + "'" +
            ", activityReport=" + getActivityReportId() +
            "}";
    }
}
