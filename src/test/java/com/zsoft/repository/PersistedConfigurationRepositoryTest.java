package com.zsoft.repository;

import com.zsoft.SsiiApp;
import com.zsoft.domain.PersistedConfiguration;
import com.zsoft.domain.User;
import com.zsoft.security.SecurityUtils;
import org.assertj.core.api.Assertions;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
@Transactional
public class PersistedConfigurationRepositoryTest {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PersistedConfigurationRepository persistedConfigurationRepository;

    @Before
    public void setUp() throws Exception {
        User user = SecurityUtils.getCurrentUserLogin()
              .flatMap(userRepository::findOneByLogin)
              .orElseThrow(IllegalStateException::new);
        persistedConfigurationRepository.save(new PersistedConfiguration().user(user).key("key1").value("value1"));
        persistedConfigurationRepository.save(new PersistedConfiguration().user(user).key("key2").value("value2"));
    }

    @After
    public void tearDown() throws Exception {
        persistedConfigurationRepository.deleteAll();
    }

    @Test
    @WithUserDetails("admin")
    public void testGetAllWithCompany() {
        assertThat(persistedConfigurationRepository.findByUserIsCurrentUser().size()).isEqualTo(2);

        persistedConfigurationRepository.deleteByUserIsCurrentAndKey("key1");

        List<PersistedConfiguration> configurations = persistedConfigurationRepository.findByUserIsCurrentUser();
        assertThat(configurations.size()).isEqualTo(1);
        assertThat(configurations.get(0).getKey()).isEqualTo("key2");
        assertThat(configurations.get(0).getValue()).isEqualTo("value2");
    }
}