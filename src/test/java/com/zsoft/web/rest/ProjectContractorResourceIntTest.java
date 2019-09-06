package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ProjectContractor;
import com.zsoft.domain.Project;
import com.zsoft.repository.ProjectContractorRepository;
import com.zsoft.service.ProjectContractorService;
import com.zsoft.service.dto.ProjectContractorDTO;
import com.zsoft.service.mapper.ProjectContractorMapper;
import com.zsoft.web.rest.errors.ExceptionTranslator;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.Validator;

import javax.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;


import static com.zsoft.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the ProjectContractorResource REST controller.
 *
 * @see ProjectContractorResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ProjectContractorResourceIntTest {

    private static final String DEFAULT_FULLNAME = "AAAAAAAAAA";
    private static final String UPDATED_FULLNAME = "BBBBBBBBBB";

    private static final String DEFAULT_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_EMAIL = "BBBBBBBBBB";

    private static final Instant DEFAULT_EMAIL_NOTIFICATION_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_EMAIL_NOTIFICATION_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String DEFAULT_TICKET = "AAAAAAAAAA";
    private static final String UPDATED_TICKET = "BBBBBBBBBB";

    @Autowired
    private ProjectContractorRepository projectContractorRepository;

    @Autowired
    private ProjectContractorMapper projectContractorMapper;

    @Autowired
    private ProjectContractorService projectContractorService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    @Autowired
    private Validator validator;

    private MockMvc restProjectContractorMockMvc;

    private ProjectContractor projectContractor;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ProjectContractorResource projectContractorResource = new ProjectContractorResource(projectContractorService);
        this.restProjectContractorMockMvc = MockMvcBuilders.standaloneSetup(projectContractorResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter)
            .setValidator(validator).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ProjectContractor createEntity(EntityManager em) {
        ProjectContractor projectContractor = new ProjectContractor()
            .fullname(DEFAULT_FULLNAME)
            .email(DEFAULT_EMAIL)
            .emailNotificationDate(DEFAULT_EMAIL_NOTIFICATION_DATE)
            .active(DEFAULT_ACTIVE)
            .ticket(DEFAULT_TICKET);
        // Add required entity
        Project project = ProjectResourceIntTest.createEntity(em);
        em.persist(project);
        em.flush();
        projectContractor.setProject(project);
        return projectContractor;
    }

    @Before
    public void initTest() {
        projectContractor = createEntity(em);
    }

    @Test
    @Transactional
    public void createProjectContractor() throws Exception {
        int databaseSizeBeforeCreate = projectContractorRepository.findAll().size();

        // Create the ProjectContractor
        ProjectContractorDTO projectContractorDTO = projectContractorMapper.toDto(projectContractor);
        restProjectContractorMockMvc.perform(post("/api/project-contractors")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectContractorDTO)))
            .andExpect(status().isCreated());

        // Validate the ProjectContractor in the database
        List<ProjectContractor> projectContractorList = projectContractorRepository.findAll();
        assertThat(projectContractorList).hasSize(databaseSizeBeforeCreate + 1);
        ProjectContractor testProjectContractor = projectContractorList.get(projectContractorList.size() - 1);
        assertThat(testProjectContractor.getFullname()).isEqualTo(DEFAULT_FULLNAME);
        assertThat(testProjectContractor.getEmail()).isEqualTo(DEFAULT_EMAIL);
        assertThat(testProjectContractor.getEmailNotificationDate()).isEqualTo(DEFAULT_EMAIL_NOTIFICATION_DATE);
        assertThat(testProjectContractor.isActive()).isEqualTo(DEFAULT_ACTIVE);
        assertThat(testProjectContractor.getTicket()).isEqualTo(DEFAULT_TICKET);
    }

    @Test
    @Transactional
    public void createProjectContractorWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = projectContractorRepository.findAll().size();

        // Create the ProjectContractor with an existing ID
        projectContractor.setId(1L);
        ProjectContractorDTO projectContractorDTO = projectContractorMapper.toDto(projectContractor);

        // An entity with an existing ID cannot be created, so this API call must fail
        restProjectContractorMockMvc.perform(post("/api/project-contractors")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectContractorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ProjectContractor in the database
        List<ProjectContractor> projectContractorList = projectContractorRepository.findAll();
        assertThat(projectContractorList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkFullnameIsRequired() throws Exception {
        int databaseSizeBeforeTest = projectContractorRepository.findAll().size();
        // set the field null
        projectContractor.setFullname(null);

        // Create the ProjectContractor, which fails.
        ProjectContractorDTO projectContractorDTO = projectContractorMapper.toDto(projectContractor);

        restProjectContractorMockMvc.perform(post("/api/project-contractors")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectContractorDTO)))
            .andExpect(status().isBadRequest());

        List<ProjectContractor> projectContractorList = projectContractorRepository.findAll();
        assertThat(projectContractorList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkEmailIsRequired() throws Exception {
        int databaseSizeBeforeTest = projectContractorRepository.findAll().size();
        // set the field null
        projectContractor.setEmail(null);

        // Create the ProjectContractor, which fails.
        ProjectContractorDTO projectContractorDTO = projectContractorMapper.toDto(projectContractor);

        restProjectContractorMockMvc.perform(post("/api/project-contractors")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectContractorDTO)))
            .andExpect(status().isBadRequest());

        List<ProjectContractor> projectContractorList = projectContractorRepository.findAll();
        assertThat(projectContractorList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllProjectContractors() throws Exception {
        // Initialize the database
        projectContractorRepository.saveAndFlush(projectContractor);

        // Get all the projectContractorList
        restProjectContractorMockMvc.perform(get("/api/project-contractors?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(projectContractor.getId().intValue())))
            .andExpect(jsonPath("$.[*].fullname").value(hasItem(DEFAULT_FULLNAME.toString())))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL.toString())))
            .andExpect(jsonPath("$.[*].emailNotificationDate").value(hasItem(DEFAULT_EMAIL_NOTIFICATION_DATE.toString())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())))
            .andExpect(jsonPath("$.[*].ticket").value(hasItem(DEFAULT_TICKET.toString())));
    }
    
    @Test
    @Transactional
    public void getProjectContractor() throws Exception {
        // Initialize the database
        projectContractorRepository.saveAndFlush(projectContractor);

        // Get the projectContractor
        restProjectContractorMockMvc.perform(get("/api/project-contractors/{id}", projectContractor.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(projectContractor.getId().intValue()))
            .andExpect(jsonPath("$.fullname").value(DEFAULT_FULLNAME.toString()))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL.toString()))
            .andExpect(jsonPath("$.emailNotificationDate").value(DEFAULT_EMAIL_NOTIFICATION_DATE.toString()))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()))
            .andExpect(jsonPath("$.ticket").value(DEFAULT_TICKET.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingProjectContractor() throws Exception {
        // Get the projectContractor
        restProjectContractorMockMvc.perform(get("/api/project-contractors/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateProjectContractor() throws Exception {
        // Initialize the database
        projectContractorRepository.saveAndFlush(projectContractor);

        int databaseSizeBeforeUpdate = projectContractorRepository.findAll().size();

        // Update the projectContractor
        ProjectContractor updatedProjectContractor = projectContractorRepository.findById(projectContractor.getId()).get();
        // Disconnect from session so that the updates on updatedProjectContractor are not directly saved in db
        em.detach(updatedProjectContractor);
        updatedProjectContractor
            .fullname(UPDATED_FULLNAME)
            .email(UPDATED_EMAIL)
            .emailNotificationDate(UPDATED_EMAIL_NOTIFICATION_DATE)
            .active(UPDATED_ACTIVE)
            .ticket(UPDATED_TICKET);
        ProjectContractorDTO projectContractorDTO = projectContractorMapper.toDto(updatedProjectContractor);

        restProjectContractorMockMvc.perform(put("/api/project-contractors")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectContractorDTO)))
            .andExpect(status().isOk());

        // Validate the ProjectContractor in the database
        List<ProjectContractor> projectContractorList = projectContractorRepository.findAll();
        assertThat(projectContractorList).hasSize(databaseSizeBeforeUpdate);
        ProjectContractor testProjectContractor = projectContractorList.get(projectContractorList.size() - 1);
        assertThat(testProjectContractor.getFullname()).isEqualTo(UPDATED_FULLNAME);
        assertThat(testProjectContractor.getEmail()).isEqualTo(UPDATED_EMAIL);
        assertThat(testProjectContractor.getEmailNotificationDate()).isEqualTo(UPDATED_EMAIL_NOTIFICATION_DATE);
        assertThat(testProjectContractor.isActive()).isEqualTo(UPDATED_ACTIVE);
        assertThat(testProjectContractor.getTicket()).isEqualTo(UPDATED_TICKET);
    }

    @Test
    @Transactional
    public void updateNonExistingProjectContractor() throws Exception {
        int databaseSizeBeforeUpdate = projectContractorRepository.findAll().size();

        // Create the ProjectContractor
        ProjectContractorDTO projectContractorDTO = projectContractorMapper.toDto(projectContractor);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProjectContractorMockMvc.perform(put("/api/project-contractors")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectContractorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ProjectContractor in the database
        List<ProjectContractor> projectContractorList = projectContractorRepository.findAll();
        assertThat(projectContractorList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteProjectContractor() throws Exception {
        // Initialize the database
        projectContractorRepository.saveAndFlush(projectContractor);

        int databaseSizeBeforeDelete = projectContractorRepository.findAll().size();

        // Delete the projectContractor
        restProjectContractorMockMvc.perform(delete("/api/project-contractors/{id}", projectContractor.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ProjectContractor> projectContractorList = projectContractorRepository.findAll();
        assertThat(projectContractorList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProjectContractor.class);
        ProjectContractor projectContractor1 = new ProjectContractor();
        projectContractor1.setId(1L);
        ProjectContractor projectContractor2 = new ProjectContractor();
        projectContractor2.setId(projectContractor1.getId());
        assertThat(projectContractor1).isEqualTo(projectContractor2);
        projectContractor2.setId(2L);
        assertThat(projectContractor1).isNotEqualTo(projectContractor2);
        projectContractor1.setId(null);
        assertThat(projectContractor1).isNotEqualTo(projectContractor2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProjectContractorDTO.class);
        ProjectContractorDTO projectContractorDTO1 = new ProjectContractorDTO();
        projectContractorDTO1.setId(1L);
        ProjectContractorDTO projectContractorDTO2 = new ProjectContractorDTO();
        assertThat(projectContractorDTO1).isNotEqualTo(projectContractorDTO2);
        projectContractorDTO2.setId(projectContractorDTO1.getId());
        assertThat(projectContractorDTO1).isEqualTo(projectContractorDTO2);
        projectContractorDTO2.setId(2L);
        assertThat(projectContractorDTO1).isNotEqualTo(projectContractorDTO2);
        projectContractorDTO1.setId(null);
        assertThat(projectContractorDTO1).isNotEqualTo(projectContractorDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(projectContractorMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(projectContractorMapper.fromId(null)).isNull();
    }
}
