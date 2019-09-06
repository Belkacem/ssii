package com.zsoft.service.security;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.util.Streamable;

import javax.annotation.Nonnull;
import java.util.Collection;
import java.util.Optional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;
import static java.util.Optional.ofNullable;

public interface EntitySecurity<T, ID> {

    JpaRepository<T, ID> getRepository();

    ID getId(T entity);

    default boolean checkReadId(ID id) {
        return isCurrentUserAdmin() || ofNullable(id)
                .flatMap(this.getRepository()::findById)
                .map(this::checkRead)
                .orElse(false);
    }

    default boolean checkReadIds(Collection<ID> ids) {
        return isCurrentUserAdmin() || ofNullable(ids)
            .map(getRepository()::findAllById)
            .map(this::checkReadCollection)
            .orElse(false);
    }

    default boolean checkReadOptional(@Nonnull Optional<T> optional) {
        return isCurrentUserAdmin() || optional
                .map(this::checkRead)
                .orElse(false);
    }

    default boolean checkRead(T entity) {
        return isCurrentUserAdmin() || ofNullable(entity)
                .map(this::checkUpdate)
                .orElse(false);
    }

    default boolean checkReadCollection(Collection<T> collection) {
        return isCurrentUserAdmin() || ofNullable(collection)
                .map(Collection::stream)
                .map(s -> s.allMatch(this::checkRead))
                .orElse(false);
    }

    default boolean checkReadPage(Page<T> page) {
        return isCurrentUserAdmin() || ofNullable(page)
                .map(Streamable::stream)
                .map(s -> s.allMatch(this::checkRead))
                .orElse(false);
    }

    default boolean checkWrite(T entity) {
        return isCurrentUserAdmin() || ofNullable(entity)
                .map(e -> this.getId(e) == null ? checkCreate(e) : checkUpdate(e))
                .orElse(false);
    }

    default boolean checkUpdateId(ID id) {
        return isCurrentUserAdmin() || ofNullable(id)
                .flatMap(this.getRepository()::findById)
                .map(this::checkUpdate)
                .orElse(false);
    }

    default boolean checkUpdateCollection(Collection<T> collection) {
        return isCurrentUserAdmin() || ofNullable(collection)
                .map(Collection::stream)
                .map(stream -> stream.allMatch(this::checkCreate))
                .orElse(false);
    }

    default boolean checkUpdate(T entity) {
        return isCurrentUserAdmin() || ofNullable(entity)
                .map(this::checkCreate)
                .orElse(false);
    }

    default boolean checkDeleteId(ID id) {
        return isCurrentUserAdmin() || ofNullable(id)
                .flatMap(this.getRepository()::findById)
                .map(this::checkDelete)
                .orElse(false);
    }

    default boolean checkDeleteIds(Iterable<ID> ids) {
        return isCurrentUserAdmin() || ofNullable(ids)
                .map(this.getRepository()::findAllById)
                .map(Collection::stream)
                .map(stream -> stream.allMatch(this::checkDelete))
                .orElse(false);
    }

    default boolean checkDeleteCollection(Collection<T> collection) {
        return isCurrentUserAdmin() || ofNullable(collection)
                .map(Collection::stream)
                .map(stream -> stream.allMatch(this::checkDelete))
                .orElse(false);
    }

    default boolean checkDelete(T entity) {
        return isCurrentUserAdmin() || ofNullable(entity)
                .map(this::checkCreate)
                .orElse(false);
    }

    default boolean checkCreateId(ID id) {
        return isCurrentUserAdmin() || ofNullable(id)
                .flatMap(this.getRepository()::findById)
                .map(this::checkCreate)
                .orElse(false);
    }

    default boolean checkCreateIds(Iterable<ID> ids) {
        return isCurrentUserAdmin() || ofNullable(ids)
                .map(this.getRepository()::findAllById)
                .map(Collection::stream)
                .map(stream -> stream.allMatch(this::checkCreate))
                .orElse(false);
    }

    default boolean checkCreateCollection(Collection<T> collection) {
        return isCurrentUserAdmin() || ofNullable(collection)
                .map(Collection::stream)
                .map(stream -> stream.allMatch(this::checkCreate))
                .orElse(false);
    }

    boolean checkCreate(T entity);

}
