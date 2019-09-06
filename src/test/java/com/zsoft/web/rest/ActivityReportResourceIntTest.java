package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ActivityReport;
import com.zsoft.domain.ProjectResource;
import com.zsoft.repository.ActivityReportRepository;
import com.zsoft.service.ActivityReportService;
import com.zsoft.service.dto.ActivityReportDTO;
import com.zsoft.service.mapper.ActivityReportMapper;
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
import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;


import static com.zsoft.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the ActivityReportResource REST controller.
 *
 * @see ActivityReportResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ActivityReportResourceIntTest {

    private static final LocalDate DEFAULT_MONTH = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_MONTH = LocalDate.now(ZoneId.systemDefault());

    private static final Boolean DEFAULT_SUBMITTED = false;
    private static final Boolean UPDATED_SUBMITTED = true;

    private static final Instant DEFAULT_SUBMISSION_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_SUBMISSION_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Boolean DEFAULT_EDITABLE = false;
    private static final Boolean UPDATED_EDITABLE = true;

    private static final String DEFAULT_COMMENT = "AAAAAAAAAA";
    private static final String UPDATED_COMMENT = "BBBBBBBBBB";

    @Autowired
    private ActivityReportRepository activityReportRepository;

    @Autowired
    private ActivityReportMapper activityReportMapper;

    @Autowired
    private ActivityReportService activityReportService;

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

    private MockMvc restActivityReportMockMvc;

    private ActivityReport activityReport;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ActivityReportResource activityReportResource = new ActivityReportResource(activityReportService);
        this.restActivityReportMockMvc = MockMvcBuilders.standaloneSetup(activityReportResource)
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
    public static ActivityReport createEntity(EntityManager em) {
        ActivityReport activityReport = new ActivityReport()
            .month(DEFAULT_MONTH)
            .submitted(DEFAULT_SUBMITTED)
            .submissionDate(DEFAULT_SUBMISSION_DATE)
            .editable(DEFAULT_EDITABLE)
            .comment(DEFAULT_COMMENT);
        // Add required entity
        ProjectResource projectResource = ProjectResourceResourceIntTest.createEntity(em);
        em.persist(projectResource);
        em.flush();
        activityReport.setProjectResource(projectResource);
        return activityReport;
    }

    @Before
    public void initTest() {
        activityReport = createEntity(em);
    }

    @Test
    @Transactional
    public void createActivityReport() throws Exception {
        int databaseSizeBeforeCreate = activityReportRepository.findAll().size();

        // Create the ActivityReport
        ActivityReportDTO activityReportDTO = activityReportMapper.toDto(activityReport);
        restActivityReportMockMvc.perform(post("/api/activity-reports")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(activityReportDTO)))
            .andExpect(status().isCreated());

        // Validate the ActivityReport in the database
        List<ActivityReport> activityReportList = activityReportRepository.findAll();
        assertThat(activityReportList).hasSize(databaseSizeBeforeCreate + 1);
        ActivityReport testActivityReport = activityReportList.get(activityReportList.size() - 1);
        assertThat(testActivityReport.getMonth()).isEqualTo(DEFAULT_MONTH);
        assertThat(testActivityReport.isSubmitted()).isEqualTo(DEFAULT_SUBMITTED);
        assertThat(testActivityReport.getSubmissionDate()).isEqualTo(DEFAULT_SUBMISSION_DATE);
        assertThat(testActivityReport.isEditable()).isEqualTo(DEFAULT_EDITABLE);
        assertThat(testActivityReport.getComment()).isEqualTo(DEFAULT_COMMENT);
    }

    @Test
    @Transactional
    public void createActivityReportWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = activityReportRepository.findAll().size();

        // Create the ActivityReport with an existing ID
        activityReport.setId(1L);
        ActivityReportDTO activityReportDTO = activityReportMapper.toDto(activityReport);

        // An entity with an existing ID cannot be created, so this API call must fail
        restActivityReportMockMvc.perform(post("/api/activity-reports")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(activityReportDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ActivityReport in the database
        List<ActivityReport> activityReportList = activityReportRepository.findAll();
        assertThat(activityReportList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkMonthIsRequired() throws Exception {
        int databaseSizeBeforeTest = activityReportRepository.findAll().size();
        // set the field null
        activityReport.setMonth(null);

        // Create the ActivityReport, which fails.
        ActivityReportDTO activityReportDTO = activityReportMapper.toDto(activityReport);

        restActivityReportMockMvc.perform(post("/api/activity-reports")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(activityReportDTO)))
            .andExpect(status().isBadRequest());

        List<ActivityReport> activityReportList = activityReportRepository.findAll();
        assertThat(activityReportList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllActivityReports() throws Exception {
        // Initialize the database
        activityReportRepository.saveAndFlush(activityReport);

        // Get all the activityReportList
        restActivityReportMockMvc.perform(get("/api/activity-reports?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(activityReport.getId().intValue())))
            .andExpect(jsonPath("$.[*].month").value(hasItem(DEFAULT_MONTH.toString())))
            .andExpect(jsonPath("$.[*].submitted").value(hasItem(DEFAULT_SUBMITTED.booleanValue())))
            .andExpect(jsonPath("$.[*].submissionDate").value(hasItem(DEFAULT_SUBMISSION_DATE.toString())))
            .andExpect(jsonPath("$.[*].editable").value(hasItem(DEFAULT_EDITABLE.booleanValue())))
            .andExpect(jsonPath("$.[*].comment").value(hasItem(DEFAULT_COMMENT.toString())));
    }
    
    @Test
    @Transactional
    public void getActivityReport() throws Exception {
        // Initialize the database
        activityReportRepository.saveAndFlush(activityReport);

        // Get the activityReport
        restActivityReportMockMvc.perform(get("/api/activity-reports/{id}", activityReport.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(activityReport.getId().intValue()))
            .andExpect(jsonPath("$.month").value(DEFAULT_MONTH.toString()))
            .andExpect(jsonPath("$.submitted").value(DEFAULT_SUBMITTED.booleanValue()))
            .andExpect(jsonPath("$.submissionDate").value(DEFAULT_SUBMISSION_DATE.toString()))
            .andExpect(jsonPath("$.editable").value(DEFAULT_EDITABLE.booleanValue()))
            .andExpect(jsonPath("$.comment").value(DEFAULT_COMMENT.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingActivityReport() throws Exception {
        // Get the activityReport
        restActivityReportMockMvc.perform(get("/api/activity-reports/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateActivityReport() throws Exception {
        // Initialize the database
        activityReportRepository.saveAndFlush(activityReport);

        int databaseSizeBeforeUpdate = activityReportRepository.findAll().size();

        // Update the activityReport
        ActivityReport updatedActivityReport = activityReportRepository.findById(activityReport.getId()).get();
        // Disconnect from session so that the updates on updatedActivityReport are not directly saved in db
        em.detach(updatedActivityReport);
        updatedActivityReport
            .month(UPDATED_MONTH)
            .submitted(UPDATED_SUBMITTED)
            .submissionDate(UPDATED_SUBMISSION_DATE)
            .editable(UPDATED_EDITABLE)
            .comment(UPDATED_COMMENT);
        ActivityReportDTO activityReportDTO = activityReportMapper.toDto(updatedActivityReport);

        restActivityReportMockMvc.perform(put("/api/activity-reports")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(activityReportDTO)))
            .andExpect(status().isOk());

        // Validate the ActivityReport in the database
        List<ActivityReport> activityReportList = activityReportRepository.findAll();
        assertThat(activityReportList).hasSize(databaseSizeBeforeUpdate);
        ActivityReport testActivityReport = activityReportList.get(activityReportList.size() - 1);
        assertThat(testActivityReport.getMonth()).isEqualTo(UPDATED_MONTH);
        assertThat(testActivityReport.isSubmitted()).isEqualTo(UPDATED_SUBMITTED);
        assertThat(testActivityReport.getSubmissionDate()).isEqualTo(UPDATED_SUBMISSION_DATE);
        assertThat(testActivityReport.isEditable()).isEqualTo(UPDATED_EDITABLE);
        assertThat(testActivityReport.getComment()).isEqualTo(UPDATED_COMMENT);
    }

    @Test
    @Transactional
    public void updateNonExistingActivityReport() throws Exception {
        int databaseSizeBeforeUpdate = activityReportRepository.findAll().size();

        // Create the ActivityReport
        ActivityReportDTO activityReportDTO = activityReportMapper.toDto(activityReport);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActivityReportMockMvc.perform(put("/api/activity-reports")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(activityReportDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ActivityReport in the database
        List<ActivityReport> activityReportList = activityReportRepository.findAll();
        assertThat(activityReportList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteActivityReport() throws Exception {
        // Initialize the database
        activityReportRepository.saveAndFlush(activityReport);

        int databaseSizeBeforeDelete = activityReportRepository.findAll().size();

        // Delete the activityReport
        restActivityReportMockMvc.perform(delete("/api/activity-reports/{id}", activityReport.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ActivityReport> activityReportList = activityReportRepository.findAll();
        assertThat(activityReportList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ActivityReport.class);
        ActivityReport activityReport1 = new ActivityReport();
        activityReport1.setId(1L);
        ActivityReport activityReport2 = new ActivityReport();
        activityReport2.setId(activityReport1.getId());
        assertThat(activityReport1).isEqualTo(activityReport2);
        activityReport2.setId(2L);
        assertThat(activityReport1).isNotEqualTo(activityReport2);
        activityReport1.setId(null);
        assertThat(activityReport1).isNotEqualTo(activityReport2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ActivityReportDTO.class);
        ActivityReportDTO activityReportDTO1 = new ActivityReportDTO();
        activityReportDTO1.setId(1L);
        ActivityReportDTO activityReportDTO2 = new ActivityReportDTO();
        assertThat(activityReportDTO1).isNotEqualTo(activityReportDTO2);
        activityReportDTO2.setId(activityReportDTO1.getId());
        assertThat(activityReportDTO1).isEqualTo(activityReportDTO2);
        activityReportDTO2.setId(2L);
        assertThat(activityReportDTO1).isNotEqualTo(activityReportDTO2);
        activityReportDTO1.setId(null);
        assertThat(activityReportDTO1).isNotEqualTo(activityReportDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(activityReportMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(activityReportMapper.fromId(null)).isNull();
    }
}
