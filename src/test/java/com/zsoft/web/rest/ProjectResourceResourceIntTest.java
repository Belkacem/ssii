package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ProjectResource;
import com.zsoft.domain.Project;
import com.zsoft.domain.Resource;
import com.zsoft.repository.ProjectResourceRepository;
import com.zsoft.service.ProjectResourceService;
import com.zsoft.service.dto.ProjectResourceDTO;
import com.zsoft.service.mapper.ProjectResourceMapper;
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
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;


import static com.zsoft.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the ProjectResourceResource REST controller.
 *
 * @see ProjectResourceResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ProjectResourceResourceIntTest {

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String DEFAULT_PROJECT_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_PROJECT_EMAIL = "BBBBBBBBBB";

    private static final Boolean DEFAULT_CAN_REPORT_EXPENSES = false;
    private static final Boolean UPDATED_CAN_REPORT_EXPENSES = true;

    private static final LocalDate DEFAULT_START_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_START_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final LocalDate DEFAULT_END_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_END_DATE = LocalDate.now(ZoneId.systemDefault());

    @Autowired
    private ProjectResourceRepository projectResourceRepository;

    @Autowired
    private ProjectResourceMapper projectResourceMapper;

    @Autowired
    private ProjectResourceService projectResourceService;

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

    private MockMvc restProjectResourceMockMvc;

    private ProjectResource projectResource;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ProjectResourceResource projectResourceResource = new ProjectResourceResource(projectResourceService);
        this.restProjectResourceMockMvc = MockMvcBuilders.standaloneSetup(projectResourceResource)
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
    public static ProjectResource createEntity(EntityManager em) {
        ProjectResource projectResource = new ProjectResource()
            .active(DEFAULT_ACTIVE)
            .projectEmail(DEFAULT_PROJECT_EMAIL)
            .canReportExpenses(DEFAULT_CAN_REPORT_EXPENSES)
            .startDate(DEFAULT_START_DATE)
            .endDate(DEFAULT_END_DATE);
        // Add required entity
        Project project = ProjectResourceIntTest.createEntity(em);
        em.persist(project);
        em.flush();
        projectResource.setProject(project);
        // Add required entity
        Resource resource = ResourceResourceIntTest.createEntity(em);
        em.persist(resource);
        em.flush();
        projectResource.setResource(resource);
        return projectResource;
    }

    @Before
    public void initTest() {
        projectResource = createEntity(em);
    }

    @Test
    @Transactional
    public void createProjectResource() throws Exception {
        int databaseSizeBeforeCreate = projectResourceRepository.findAll().size();

        // Create the ProjectResource
        ProjectResourceDTO projectResourceDTO = projectResourceMapper.toDto(projectResource);
        restProjectResourceMockMvc.perform(post("/api/project-resources")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceDTO)))
            .andExpect(status().isCreated());

        // Validate the ProjectResource in the database
        List<ProjectResource> projectResourceList = projectResourceRepository.findAll();
        assertThat(projectResourceList).hasSize(databaseSizeBeforeCreate + 1);
        ProjectResource testProjectResource = projectResourceList.get(projectResourceList.size() - 1);
        assertThat(testProjectResource.isActive()).isEqualTo(DEFAULT_ACTIVE);
        assertThat(testProjectResource.getProjectEmail()).isEqualTo(DEFAULT_PROJECT_EMAIL);
        assertThat(testProjectResource.isCanReportExpenses()).isEqualTo(DEFAULT_CAN_REPORT_EXPENSES);
        assertThat(testProjectResource.getStartDate()).isEqualTo(DEFAULT_START_DATE);
        assertThat(testProjectResource.getEndDate()).isEqualTo(DEFAULT_END_DATE);
    }

    @Test
    @Transactional
    public void createProjectResourceWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = projectResourceRepository.findAll().size();

        // Create the ProjectResource with an existing ID
        projectResource.setId(1L);
        ProjectResourceDTO projectResourceDTO = projectResourceMapper.toDto(projectResource);

        // An entity with an existing ID cannot be created, so this API call must fail
        restProjectResourceMockMvc.perform(post("/api/project-resources")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ProjectResource in the database
        List<ProjectResource> projectResourceList = projectResourceRepository.findAll();
        assertThat(projectResourceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkActiveIsRequired() throws Exception {
        int databaseSizeBeforeTest = projectResourceRepository.findAll().size();
        // set the field null
        projectResource.setActive(null);

        // Create the ProjectResource, which fails.
        ProjectResourceDTO projectResourceDTO = projectResourceMapper.toDto(projectResource);

        restProjectResourceMockMvc.perform(post("/api/project-resources")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceDTO)))
            .andExpect(status().isBadRequest());

        List<ProjectResource> projectResourceList = projectResourceRepository.findAll();
        assertThat(projectResourceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkStartDateIsRequired() throws Exception {
        int databaseSizeBeforeTest = projectResourceRepository.findAll().size();
        // set the field null
        projectResource.setStartDate(null);

        // Create the ProjectResource, which fails.
        ProjectResourceDTO projectResourceDTO = projectResourceMapper.toDto(projectResource);

        restProjectResourceMockMvc.perform(post("/api/project-resources")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceDTO)))
            .andExpect(status().isBadRequest());

        List<ProjectResource> projectResourceList = projectResourceRepository.findAll();
        assertThat(projectResourceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllProjectResources() throws Exception {
        // Initialize the database
        projectResourceRepository.saveAndFlush(projectResource);

        // Get all the projectResourceList
        restProjectResourceMockMvc.perform(get("/api/project-resources?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(projectResource.getId().intValue())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())))
            .andExpect(jsonPath("$.[*].projectEmail").value(hasItem(DEFAULT_PROJECT_EMAIL.toString())))
            .andExpect(jsonPath("$.[*].canReportExpenses").value(hasItem(DEFAULT_CAN_REPORT_EXPENSES.booleanValue())))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())));
    }
    
    @Test
    @Transactional
    public void getProjectResource() throws Exception {
        // Initialize the database
        projectResourceRepository.saveAndFlush(projectResource);

        // Get the projectResource
        restProjectResourceMockMvc.perform(get("/api/project-resources/{id}", projectResource.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(projectResource.getId().intValue()))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()))
            .andExpect(jsonPath("$.projectEmail").value(DEFAULT_PROJECT_EMAIL.toString()))
            .andExpect(jsonPath("$.canReportExpenses").value(DEFAULT_CAN_REPORT_EXPENSES.booleanValue()))
            .andExpect(jsonPath("$.startDate").value(DEFAULT_START_DATE.toString()))
            .andExpect(jsonPath("$.endDate").value(DEFAULT_END_DATE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingProjectResource() throws Exception {
        // Get the projectResource
        restProjectResourceMockMvc.perform(get("/api/project-resources/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateProjectResource() throws Exception {
        // Initialize the database
        projectResourceRepository.saveAndFlush(projectResource);

        int databaseSizeBeforeUpdate = projectResourceRepository.findAll().size();

        // Update the projectResource
        ProjectResource updatedProjectResource = projectResourceRepository.findById(projectResource.getId()).get();
        // Disconnect from session so that the updates on updatedProjectResource are not directly saved in db
        em.detach(updatedProjectResource);
        updatedProjectResource
            .active(UPDATED_ACTIVE)
            .projectEmail(UPDATED_PROJECT_EMAIL)
            .canReportExpenses(UPDATED_CAN_REPORT_EXPENSES)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE);
        ProjectResourceDTO projectResourceDTO = projectResourceMapper.toDto(updatedProjectResource);

        restProjectResourceMockMvc.perform(put("/api/project-resources")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceDTO)))
            .andExpect(status().isOk());

        // Validate the ProjectResource in the database
        List<ProjectResource> projectResourceList = projectResourceRepository.findAll();
        assertThat(projectResourceList).hasSize(databaseSizeBeforeUpdate);
        ProjectResource testProjectResource = projectResourceList.get(projectResourceList.size() - 1);
        assertThat(testProjectResource.isActive()).isEqualTo(UPDATED_ACTIVE);
        assertThat(testProjectResource.getProjectEmail()).isEqualTo(UPDATED_PROJECT_EMAIL);
        assertThat(testProjectResource.isCanReportExpenses()).isEqualTo(UPDATED_CAN_REPORT_EXPENSES);
        assertThat(testProjectResource.getStartDate()).isEqualTo(UPDATED_START_DATE);
        assertThat(testProjectResource.getEndDate()).isEqualTo(UPDATED_END_DATE);
    }

    @Test
    @Transactional
    public void updateNonExistingProjectResource() throws Exception {
        int databaseSizeBeforeUpdate = projectResourceRepository.findAll().size();

        // Create the ProjectResource
        ProjectResourceDTO projectResourceDTO = projectResourceMapper.toDto(projectResource);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProjectResourceMockMvc.perform(put("/api/project-resources")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ProjectResource in the database
        List<ProjectResource> projectResourceList = projectResourceRepository.findAll();
        assertThat(projectResourceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteProjectResource() throws Exception {
        // Initialize the database
        projectResourceRepository.saveAndFlush(projectResource);

        int databaseSizeBeforeDelete = projectResourceRepository.findAll().size();

        // Delete the projectResource
        restProjectResourceMockMvc.perform(delete("/api/project-resources/{id}", projectResource.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ProjectResource> projectResourceList = projectResourceRepository.findAll();
        assertThat(projectResourceList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProjectResource.class);
        ProjectResource projectResource1 = new ProjectResource();
        projectResource1.setId(1L);
        ProjectResource projectResource2 = new ProjectResource();
        projectResource2.setId(projectResource1.getId());
        assertThat(projectResource1).isEqualTo(projectResource2);
        projectResource2.setId(2L);
        assertThat(projectResource1).isNotEqualTo(projectResource2);
        projectResource1.setId(null);
        assertThat(projectResource1).isNotEqualTo(projectResource2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProjectResourceDTO.class);
        ProjectResourceDTO projectResourceDTO1 = new ProjectResourceDTO();
        projectResourceDTO1.setId(1L);
        ProjectResourceDTO projectResourceDTO2 = new ProjectResourceDTO();
        assertThat(projectResourceDTO1).isNotEqualTo(projectResourceDTO2);
        projectResourceDTO2.setId(projectResourceDTO1.getId());
        assertThat(projectResourceDTO1).isEqualTo(projectResourceDTO2);
        projectResourceDTO2.setId(2L);
        assertThat(projectResourceDTO1).isNotEqualTo(projectResourceDTO2);
        projectResourceDTO1.setId(null);
        assertThat(projectResourceDTO1).isNotEqualTo(projectResourceDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(projectResourceMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(projectResourceMapper.fromId(null)).isNull();
    }
}
