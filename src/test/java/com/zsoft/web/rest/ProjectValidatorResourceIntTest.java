package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ProjectValidator;
import com.zsoft.domain.Project;
import com.zsoft.repository.ProjectValidatorRepository;
import com.zsoft.service.ProjectValidatorService;
import com.zsoft.service.dto.ProjectValidatorDTO;
import com.zsoft.service.mapper.ProjectValidatorMapper;
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
 * Test class for the ProjectValidatorResource REST controller.
 *
 * @see ProjectValidatorResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ProjectValidatorResourceIntTest {

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
    private ProjectValidatorRepository projectValidatorRepository;

    @Autowired
    private ProjectValidatorMapper projectValidatorMapper;

    @Autowired
    private ProjectValidatorService projectValidatorService;

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

    private MockMvc restProjectValidatorMockMvc;

    private ProjectValidator projectValidator;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ProjectValidatorResource projectValidatorResource = new ProjectValidatorResource(projectValidatorService);
        this.restProjectValidatorMockMvc = MockMvcBuilders.standaloneSetup(projectValidatorResource)
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
    public static ProjectValidator createEntity(EntityManager em) {
        ProjectValidator projectValidator = new ProjectValidator()
            .fullname(DEFAULT_FULLNAME)
            .email(DEFAULT_EMAIL)
            .emailNotificationDate(DEFAULT_EMAIL_NOTIFICATION_DATE)
            .active(DEFAULT_ACTIVE)
            .ticket(DEFAULT_TICKET);
        // Add required entity
        Project project = ProjectResourceIntTest.createEntity(em);
        em.persist(project);
        em.flush();
        projectValidator.setProject(project);
        return projectValidator;
    }

    @Before
    public void initTest() {
        projectValidator = createEntity(em);
    }

    @Test
    @Transactional
    public void createProjectValidator() throws Exception {
        int databaseSizeBeforeCreate = projectValidatorRepository.findAll().size();

        // Create the ProjectValidator
        ProjectValidatorDTO projectValidatorDTO = projectValidatorMapper.toDto(projectValidator);
        restProjectValidatorMockMvc.perform(post("/api/project-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectValidatorDTO)))
            .andExpect(status().isCreated());

        // Validate the ProjectValidator in the database
        List<ProjectValidator> projectValidatorList = projectValidatorRepository.findAll();
        assertThat(projectValidatorList).hasSize(databaseSizeBeforeCreate + 1);
        ProjectValidator testProjectValidator = projectValidatorList.get(projectValidatorList.size() - 1);
        assertThat(testProjectValidator.getFullname()).isEqualTo(DEFAULT_FULLNAME);
        assertThat(testProjectValidator.getEmail()).isEqualTo(DEFAULT_EMAIL);
        assertThat(testProjectValidator.getEmailNotificationDate()).isEqualTo(DEFAULT_EMAIL_NOTIFICATION_DATE);
        assertThat(testProjectValidator.isActive()).isEqualTo(DEFAULT_ACTIVE);
        assertThat(testProjectValidator.getTicket()).isEqualTo(DEFAULT_TICKET);
    }

    @Test
    @Transactional
    public void createProjectValidatorWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = projectValidatorRepository.findAll().size();

        // Create the ProjectValidator with an existing ID
        projectValidator.setId(1L);
        ProjectValidatorDTO projectValidatorDTO = projectValidatorMapper.toDto(projectValidator);

        // An entity with an existing ID cannot be created, so this API call must fail
        restProjectValidatorMockMvc.perform(post("/api/project-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectValidatorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ProjectValidator in the database
        List<ProjectValidator> projectValidatorList = projectValidatorRepository.findAll();
        assertThat(projectValidatorList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkFullnameIsRequired() throws Exception {
        int databaseSizeBeforeTest = projectValidatorRepository.findAll().size();
        // set the field null
        projectValidator.setFullname(null);

        // Create the ProjectValidator, which fails.
        ProjectValidatorDTO projectValidatorDTO = projectValidatorMapper.toDto(projectValidator);

        restProjectValidatorMockMvc.perform(post("/api/project-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectValidatorDTO)))
            .andExpect(status().isBadRequest());

        List<ProjectValidator> projectValidatorList = projectValidatorRepository.findAll();
        assertThat(projectValidatorList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkEmailIsRequired() throws Exception {
        int databaseSizeBeforeTest = projectValidatorRepository.findAll().size();
        // set the field null
        projectValidator.setEmail(null);

        // Create the ProjectValidator, which fails.
        ProjectValidatorDTO projectValidatorDTO = projectValidatorMapper.toDto(projectValidator);

        restProjectValidatorMockMvc.perform(post("/api/project-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectValidatorDTO)))
            .andExpect(status().isBadRequest());

        List<ProjectValidator> projectValidatorList = projectValidatorRepository.findAll();
        assertThat(projectValidatorList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllProjectValidators() throws Exception {
        // Initialize the database
        projectValidatorRepository.saveAndFlush(projectValidator);

        // Get all the projectValidatorList
        restProjectValidatorMockMvc.perform(get("/api/project-validators?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(projectValidator.getId().intValue())))
            .andExpect(jsonPath("$.[*].fullname").value(hasItem(DEFAULT_FULLNAME.toString())))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL.toString())))
            .andExpect(jsonPath("$.[*].emailNotificationDate").value(hasItem(DEFAULT_EMAIL_NOTIFICATION_DATE.toString())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())))
            .andExpect(jsonPath("$.[*].ticket").value(hasItem(DEFAULT_TICKET.toString())));
    }
    
    @Test
    @Transactional
    public void getProjectValidator() throws Exception {
        // Initialize the database
        projectValidatorRepository.saveAndFlush(projectValidator);

        // Get the projectValidator
        restProjectValidatorMockMvc.perform(get("/api/project-validators/{id}", projectValidator.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(projectValidator.getId().intValue()))
            .andExpect(jsonPath("$.fullname").value(DEFAULT_FULLNAME.toString()))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL.toString()))
            .andExpect(jsonPath("$.emailNotificationDate").value(DEFAULT_EMAIL_NOTIFICATION_DATE.toString()))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()))
            .andExpect(jsonPath("$.ticket").value(DEFAULT_TICKET.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingProjectValidator() throws Exception {
        // Get the projectValidator
        restProjectValidatorMockMvc.perform(get("/api/project-validators/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateProjectValidator() throws Exception {
        // Initialize the database
        projectValidatorRepository.saveAndFlush(projectValidator);

        int databaseSizeBeforeUpdate = projectValidatorRepository.findAll().size();

        // Update the projectValidator
        ProjectValidator updatedProjectValidator = projectValidatorRepository.findById(projectValidator.getId()).get();
        // Disconnect from session so that the updates on updatedProjectValidator are not directly saved in db
        em.detach(updatedProjectValidator);
        updatedProjectValidator
            .fullname(UPDATED_FULLNAME)
            .email(UPDATED_EMAIL)
            .emailNotificationDate(UPDATED_EMAIL_NOTIFICATION_DATE)
            .active(UPDATED_ACTIVE)
            .ticket(UPDATED_TICKET);
        ProjectValidatorDTO projectValidatorDTO = projectValidatorMapper.toDto(updatedProjectValidator);

        restProjectValidatorMockMvc.perform(put("/api/project-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectValidatorDTO)))
            .andExpect(status().isOk());

        // Validate the ProjectValidator in the database
        List<ProjectValidator> projectValidatorList = projectValidatorRepository.findAll();
        assertThat(projectValidatorList).hasSize(databaseSizeBeforeUpdate);
        ProjectValidator testProjectValidator = projectValidatorList.get(projectValidatorList.size() - 1);
        assertThat(testProjectValidator.getFullname()).isEqualTo(UPDATED_FULLNAME);
        assertThat(testProjectValidator.getEmail()).isEqualTo(UPDATED_EMAIL);
        assertThat(testProjectValidator.getEmailNotificationDate()).isEqualTo(UPDATED_EMAIL_NOTIFICATION_DATE);
        assertThat(testProjectValidator.isActive()).isEqualTo(UPDATED_ACTIVE);
        assertThat(testProjectValidator.getTicket()).isEqualTo(UPDATED_TICKET);
    }

    @Test
    @Transactional
    public void updateNonExistingProjectValidator() throws Exception {
        int databaseSizeBeforeUpdate = projectValidatorRepository.findAll().size();

        // Create the ProjectValidator
        ProjectValidatorDTO projectValidatorDTO = projectValidatorMapper.toDto(projectValidator);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProjectValidatorMockMvc.perform(put("/api/project-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectValidatorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ProjectValidator in the database
        List<ProjectValidator> projectValidatorList = projectValidatorRepository.findAll();
        assertThat(projectValidatorList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteProjectValidator() throws Exception {
        // Initialize the database
        projectValidatorRepository.saveAndFlush(projectValidator);

        int databaseSizeBeforeDelete = projectValidatorRepository.findAll().size();

        // Delete the projectValidator
        restProjectValidatorMockMvc.perform(delete("/api/project-validators/{id}", projectValidator.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ProjectValidator> projectValidatorList = projectValidatorRepository.findAll();
        assertThat(projectValidatorList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProjectValidator.class);
        ProjectValidator projectValidator1 = new ProjectValidator();
        projectValidator1.setId(1L);
        ProjectValidator projectValidator2 = new ProjectValidator();
        projectValidator2.setId(projectValidator1.getId());
        assertThat(projectValidator1).isEqualTo(projectValidator2);
        projectValidator2.setId(2L);
        assertThat(projectValidator1).isNotEqualTo(projectValidator2);
        projectValidator1.setId(null);
        assertThat(projectValidator1).isNotEqualTo(projectValidator2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProjectValidatorDTO.class);
        ProjectValidatorDTO projectValidatorDTO1 = new ProjectValidatorDTO();
        projectValidatorDTO1.setId(1L);
        ProjectValidatorDTO projectValidatorDTO2 = new ProjectValidatorDTO();
        assertThat(projectValidatorDTO1).isNotEqualTo(projectValidatorDTO2);
        projectValidatorDTO2.setId(projectValidatorDTO1.getId());
        assertThat(projectValidatorDTO1).isEqualTo(projectValidatorDTO2);
        projectValidatorDTO2.setId(2L);
        assertThat(projectValidatorDTO1).isNotEqualTo(projectValidatorDTO2);
        projectValidatorDTO1.setId(null);
        assertThat(projectValidatorDTO1).isNotEqualTo(projectValidatorDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(projectValidatorMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(projectValidatorMapper.fromId(null)).isNull();
    }
}
