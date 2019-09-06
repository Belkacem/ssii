package com.zsoft.service.dto;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the PersistedConfiguration entity.
 */
public class PersistedConfigurationDTO implements Serializable {

    private Long id;

    private String key;

    private String value;


    private Long userId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        PersistedConfigurationDTO persistedConfigurationDTO = (PersistedConfigurationDTO) o;
        if (persistedConfigurationDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), persistedConfigurationDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "PersistedConfigurationDTO{" +
            "id=" + getId() +
            ", key='" + getKey() + "'" +
            ", value='" + getValue() + "'" +
            ", user=" + getUserId() +
            "}";
    }
}
