package com.zsoft.repository;

import com.zsoft.SsiiApp;
import com.zsoft.domain.Company;
import com.zsoft.domain.Project;
import com.zsoft.domain.ProjectValidator;
import com.zsoft.domain.User;
import com.zsoft.domain.enumeration.Form;
import com.zsoft.security.AuthoritiesConstants;
import com.zsoft.security.SecurityUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mapstruct.ap.internal.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
@Transactional
public class ProjectValidatorRepositoryTest {

    @Autowired
    ProjectValidatorRepository projectValidatorRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    CompanyRepository companyRepository;

    @Autowired
    ProjectRepository projectRepository;

    @Before
    public void setUp() throws Exception {
        User user = SecurityUtils.getCurrentUserLogin()
              .flatMap(userRepository::findOneByLogin)
              .orElseThrow(IllegalStateException::new);
        Company company1 = new Company();
        company1.setId(1L);
        company1.setOwner(user);
        company1.setName("company1");
        company1.setSiren("123456789");
        company1.setForm(Form.SAS);
        companyRepository.save(company1);
        Company company2 = new Company();
        company2.setId(2L);
        company2.setOwner(user);
        company2.setName("company1");
        company2.setSiren("123456789");
        company2.setForm(Form.SAS);
        companyRepository.save(company2);
        Project project1 = new Project();
        project1.setId(1L);
        project1.setNom("project1");
        project1.setCompany(company1);
        projectRepository.save(project1);
        Project project2 = new Project();
        project2.setId(2L);
        project2.setNom("project2");
        project2.setCompany(company2);
        projectRepository.save(project2);
        ProjectValidator projectValidator1 = new ProjectValidator().user(user).project(project1).email("test1").fullname("test1");
        ProjectValidator projectValidator2 = new ProjectValidator().user(user).project(project2).email("test2").fullname("test2");
        projectValidatorRepository.save(projectValidator1);
        projectValidatorRepository.save(projectValidator2);
    }

    @After
    public void tearDown() throws Exception {
        companyRepository.deleteAll();
        projectRepository.deleteAll();
        projectValidatorRepository.deleteAll();
    }

    @Test
    @WithUserDetails("admin")
    public void testGetAllWithCompany() {
        List<ProjectValidator> projectValidators = projectValidatorRepository.findByUserIsCurrentUserAndCompanyId(1L);
        assertThat(projectValidators.size()).isEqualTo(1);
        assertThat(projectValidators.get(0).getId()).isEqualTo(1);
        assertThat( projectValidators.get(0).getFullname()).isEqualTo("test1");

        projectValidators = projectValidatorRepository.findByUserIsCurrentUserAndCompanyId(2L);
        assertThat(projectValidators.size()).isEqualTo(1);
        assertThat(projectValidators.get(0).getId()).isEqualTo(2);
        assertThat(projectValidators.get(0).getFullname()).isEqualTo("test2");

        projectValidators = projectValidatorRepository.findByUserIsCurrentUser();
        assertThat(projectValidators.size()).isEqualTo(2);
    }
}