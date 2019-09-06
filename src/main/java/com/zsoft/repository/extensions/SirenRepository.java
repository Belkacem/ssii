package com.zsoft.repository.extensions;

import com.zsoft.security.AuthoritiesConstants;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@SuppressWarnings("all")
@FeignClient(name = "siren-api", url = "https://entreprise.data.gouv.fr/api/sirene/v2/")
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface SirenRepository {

    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "siren/{siren}", method = RequestMethod.GET)
    String getSirenInfo(@PathVariable("siren") String siren);

}
