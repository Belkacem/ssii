package com.zsoft.service.security;

import com.zsoft.domain.Client;
import com.zsoft.repository.extensions.ClientRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ClientSecurity implements EntitySecurity<Client, Long> {

    private final ClientRepositoryExt clientRepositoryExt;
    private CompanySecurity companySecurity;

    public ClientSecurity(ClientRepositoryExt clientRepositoryExt) {
        this.clientRepositoryExt = clientRepositoryExt;
    }

    @Override
    public JpaRepository<Client, Long> getRepository() {
        return this.clientRepositoryExt;
    }

    @Autowired
    public void setCompanySecurity(CompanySecurity companySecurity) {
        this.companySecurity = companySecurity;
    }

    @Override
    public Long getId(Client client) {
        return client.getId();
    }

    @Override
    public boolean checkCreate(Client client) {
        return client.getCompany() == null ?
                checkCreateId(client.getId()) :
                this.companySecurity.checkCreate(client.getCompany());
    }

}
