package com.zsoft.repository.extensions;

import com.zsoft.security.AuthoritiesConstants;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@SuppressWarnings("all")
@FeignClient(name = "address-api", url = "https://api-adresse.data.gouv.fr/")
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface AddressRepository {

    @PreAuthorize("isAuthenticated()")
    @RequestMapping(
        method = RequestMethod.GET,
        value = "/search"
    )
    String getAddresses(@RequestParam("q") String query);

}
