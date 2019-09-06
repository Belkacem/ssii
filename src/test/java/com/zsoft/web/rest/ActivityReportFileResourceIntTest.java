package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ActivityReportFile;
import com.zsoft.domain.ActivityReport;
import com.zsoft.repository.ActivityReportFileRepository;
import com.zsoft.service.ActivityReportFileService;
import com.zsoft.service.dto.ActivityReportFileDTO;
import com.zsoft.service.mapper.ActivityReportFileMapper;
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
import org.springframework.util.Base64Utils;
import org.springframework.validation.Validator;

import javax.persistence.EntityManager;
import java.util.List;


import static com.zsoft.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the ActivityReportFileResource REST controller.
 *
 * @see ActivityReportFileResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ActivityReportFileResourceIntTest {

    private static final byte[] DEFAULT_FILE = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_FILE = TestUtil.createByteArray(1, "1");
    private static final String DEFAULT_FILE_CONTENT_TYPE = "image/jpg";
    private static final String UPDATED_FILE_CONTENT_TYPE = "image/png";

    @Autowired
    private ActivityReportFileRepository activityReportFileRepository;

    @Autowired
    private ActivityReportFileMapper activityReportFileMapper;

    @Autowired
    private ActivityReportFileService activityReportFileService;

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

    private MockMvc restActivityReportFileMockMvc;

    private ActivityReportFile activityReportFile;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ActivityReportFileResource activityReportFileResource = new ActivityReportFileResource(activityReportFileService);
        this.restActivityReportFileMockMvc = MockMvcBuilders.standaloneSetup(activityReportFileResource)
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
    public static ActivityReportFile createEntity(EntityManager em) {
        ActivityReportFile activityReportFile = new ActivityReportFile()
            .file(DEFAULT_FILE)
            .fileContentType(DEFAULT_FILE_CONTENT_TYPE);
        // Add required entity
        ActivityReport activityReport = ActivityReportResourceIntTest.createEntity(em);
        em.persist(activityReport);
        em.flush();
        activityReportFile.setActivityReport(activityReport);
        return activityReportFile;
    }

    @Before
    public void initTest() {
        activityReportFile = createEntity(em);
    }

    @Test
    @Transactional
    public void createActivityReportFile() throws Exception {
        int databaseSizeBeforeCreate = activityReportFileRepository.findAll().size();

        // Create the ActivityReportFile
        ActivityReportFileDTO activityReportFileDTO = activityReportFileMapper.toDto(activityReportFile);
        restActivityReportFileMockMvc.perform(post("/api/activity-report-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(activityReportFileDTO)))
            .andExpect(status().isCreated());

        // Validate the ActivityReportFile in the database
        List<ActivityReportFile> activityReportFileList = activityReportFileRepository.findAll();
        assertThat(activityReportFileList).hasSize(databaseSizeBeforeCreate + 1);
        ActivityReportFile testActivityReportFile = activityReportFileList.get(activityReportFileList.size() - 1);
        assertThat(testActivityReportFile.getFile()).isEqualTo(DEFAULT_FILE);
        assertThat(testActivityReportFile.getFileContentType()).isEqualTo(DEFAULT_FILE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void createActivityReportFileWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = activityReportFileRepository.findAll().size();

        // Create the ActivityReportFile with an existing ID
        activityReportFile.setId(1L);
        ActivityReportFileDTO activityReportFileDTO = activityReportFileMapper.toDto(activityReportFile);

        // An entity with an existing ID cannot be created, so this API call must fail
        restActivityReportFileMockMvc.perform(post("/api/activity-report-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(activityReportFileDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ActivityReportFile in the database
        List<ActivityReportFile> activityReportFileList = activityReportFileRepository.findAll();
        assertThat(activityReportFileList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllActivityReportFiles() throws Exception {
        // Initialize the database
        activityReportFileRepository.saveAndFlush(activityReportFile);

        // Get all the activityReportFileList
        restActivityReportFileMockMvc.perform(get("/api/activity-report-files?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(activityReportFile.getId().intValue())))
            .andExpect(jsonPath("$.[*].fileContentType").value(hasItem(DEFAULT_FILE_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].file").value(hasItem(Base64Utils.encodeToString(DEFAULT_FILE))));
    }
    
    @Test
    @Transactional
    public void getActivityReportFile() throws Exception {
        // Initialize the database
        activityReportFileRepository.saveAndFlush(activityReportFile);

        // Get the activityReportFile
        restActivityReportFileMockMvc.perform(get("/api/activity-report-files/{id}", activityReportFile.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(activityReportFile.getId().intValue()))
            .andExpect(jsonPath("$.fileContentType").value(DEFAULT_FILE_CONTENT_TYPE))
            .andExpect(jsonPath("$.file").value(Base64Utils.encodeToString(DEFAULT_FILE)));
    }

    @Test
    @Transactional
    public void getNonExistingActivityReportFile() throws Exception {
        // Get the activityReportFile
        restActivityReportFileMockMvc.perform(get("/api/activity-report-files/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateActivityReportFile() throws Exception {
        // Initialize the database
        activityReportFileRepository.saveAndFlush(activityReportFile);

        int databaseSizeBeforeUpdate = activityReportFileRepository.findAll().size();

        // Update the activityReportFile
        ActivityReportFile updatedActivityReportFile = activityReportFileRepository.findById(activityReportFile.getId()).get();
        // Disconnect from session so that the updates on updatedActivityReportFile are not directly saved in db
        em.detach(updatedActivityReportFile);
        updatedActivityReportFile
            .file(UPDATED_FILE)
            .fileContentType(UPDATED_FILE_CONTENT_TYPE);
        ActivityReportFileDTO activityReportFileDTO = activityReportFileMapper.toDto(updatedActivityReportFile);

        restActivityReportFileMockMvc.perform(put("/api/activity-report-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(activityReportFileDTO)))
            .andExpect(status().isOk());

        // Validate the ActivityReportFile in the database
        List<ActivityReportFile> activityReportFileList = activityReportFileRepository.findAll();
        assertThat(activityReportFileList).hasSize(databaseSizeBeforeUpdate);
        ActivityReportFile testActivityReportFile = activityReportFileList.get(activityReportFileList.size() - 1);
        assertThat(testActivityReportFile.getFile()).isEqualTo(UPDATED_FILE);
        assertThat(testActivityReportFile.getFileContentType()).isEqualTo(UPDATED_FILE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void updateNonExistingActivityReportFile() throws Exception {
        int databaseSizeBeforeUpdate = activityReportFileRepository.findAll().size();

        // Create the ActivityReportFile
        ActivityReportFileDTO activityReportFileDTO = activityReportFileMapper.toDto(activityReportFile);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActivityReportFileMockMvc.perform(put("/api/activity-report-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(activityReportFileDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ActivityReportFile in the database
        List<ActivityReportFile> activityReportFileList = activityReportFileRepository.findAll();
        assertThat(activityReportFileList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteActivityReportFile() throws Exception {
        // Initialize the database
        activityReportFileRepository.saveAndFlush(activityReportFile);

        int databaseSizeBeforeDelete = activityReportFileRepository.findAll().size();

        // Delete the activityReportFile
        restActivityReportFileMockMvc.perform(delete("/api/activity-report-files/{id}", activityReportFile.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ActivityReportFile> activityReportFileList = activityReportFileRepository.findAll();
        assertThat(activityReportFileList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ActivityReportFile.class);
        ActivityReportFile activityReportFile1 = new ActivityReportFile();
        activityReportFile1.setId(1L);
        ActivityReportFile activityReportFile2 = new ActivityReportFile();
        activityReportFile2.setId(activityReportFile1.getId());
        assertThat(activityReportFile1).isEqualTo(activityReportFile2);
        activityReportFile2.setId(2L);
        assertThat(activityReportFile1).isNotEqualTo(activityReportFile2);
        activityReportFile1.setId(null);
        assertThat(activityReportFile1).isNotEqualTo(activityReportFile2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ActivityReportFileDTO.class);
        ActivityReportFileDTO activityReportFileDTO1 = new ActivityReportFileDTO();
        activityReportFileDTO1.setId(1L);
        ActivityReportFileDTO activityReportFileDTO2 = new ActivityReportFileDTO();
        assertThat(activityReportFileDTO1).isNotEqualTo(activityReportFileDTO2);
        activityReportFileDTO2.setId(activityReportFileDTO1.getId());
        assertThat(activityReportFileDTO1).isEqualTo(activityReportFileDTO2);
        activityReportFileDTO2.setId(2L);
        assertThat(activityReportFileDTO1).isNotEqualTo(activityReportFileDTO2);
        activityReportFileDTO1.setId(null);
        assertThat(activityReportFileDTO1).isNotEqualTo(activityReportFileDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(activityReportFileMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(activityReportFileMapper.fromId(null)).isNull();
    }
}
