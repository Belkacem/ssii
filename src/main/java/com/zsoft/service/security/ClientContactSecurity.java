package com.zsoft.service.security;

import com.zsoft.domain.ClientContact;
import com.zsoft.repository.extensions.ClientContactRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ClientContactSecurity implements EntitySecurity<ClientContact, Long> {

    private final ClientContactRepositoryExt clientContactRepositoryExt;
    private ClientSecurity clientSecurity;

    public ClientContactSecurity(ClientContactRepositoryExt clientContactRepositoryExt) {
        this.clientContactRepositoryExt = clientContactRepositoryExt;
    }

    @Override
    public JpaRepository<ClientContact, Long> getRepository() {
        return this.clientContactRepositoryExt;
    }

    @Autowired
    public void setClientSecurity(ClientSecurity clientSecurity) {
        this.clientSecurity = clientSecurity;
    }

    @Override
    public Long getId(ClientContact clientContact) {
        return clientContact.getId();
    }

    @Override
    public boolean checkCreate(ClientContact clientContact) {
        return clientContact.getClient() == null
            ? checkCreateId(clientContact.getId())
            : this.clientSecurity.checkCreate(clientContact.getClient());
    }

}
