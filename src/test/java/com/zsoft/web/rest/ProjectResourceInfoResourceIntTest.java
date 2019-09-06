package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ProjectResourceInfo;
import com.zsoft.domain.ProjectResource;
import com.zsoft.repository.ProjectResourceInfoRepository;
import com.zsoft.service.ProjectResourceInfoService;
import com.zsoft.service.dto.ProjectResourceInfoDTO;
import com.zsoft.service.mapper.ProjectResourceInfoMapper;
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
 * Test class for the ProjectResourceInfoResource REST controller.
 *
 * @see ProjectResourceInfoResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ProjectResourceInfoResourceIntTest {

    private static final LocalDate DEFAULT_START_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_START_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Float DEFAULT_DAILY_RATE = 1F;
    private static final Float UPDATED_DAILY_RATE = 2F;

    private static final Integer DEFAULT_PAYMENT_DELAY = 1;
    private static final Integer UPDATED_PAYMENT_DELAY = 2;

    private static final String DEFAULT_REFERENCE = "AAAAAAAAAA";
    private static final String UPDATED_REFERENCE = "BBBBBBBBBB";

    @Autowired
    private ProjectResourceInfoRepository projectResourceInfoRepository;

    @Autowired
    private ProjectResourceInfoMapper projectResourceInfoMapper;

    @Autowired
    private ProjectResourceInfoService projectResourceInfoService;

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

    private MockMvc restProjectResourceInfoMockMvc;

    private ProjectResourceInfo projectResourceInfo;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ProjectResourceInfoResource projectResourceInfoResource = new ProjectResourceInfoResource(projectResourceInfoService);
        this.restProjectResourceInfoMockMvc = MockMvcBuilders.standaloneSetup(projectResourceInfoResource)
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
    public static ProjectResourceInfo createEntity(EntityManager em) {
        ProjectResourceInfo projectResourceInfo = new ProjectResourceInfo()
            .startDate(DEFAULT_START_DATE)
            .dailyRate(DEFAULT_DAILY_RATE)
            .paymentDelay(DEFAULT_PAYMENT_DELAY)
            .reference(DEFAULT_REFERENCE);
        // Add required entity
        ProjectResource projectResource = ProjectResourceResourceIntTest.createEntity(em);
        em.persist(projectResource);
        em.flush();
        projectResourceInfo.setProjectResource(projectResource);
        return projectResourceInfo;
    }

    @Before
    public void initTest() {
        projectResourceInfo = createEntity(em);
    }

    @Test
    @Transactional
    public void createProjectResourceInfo() throws Exception {
        int databaseSizeBeforeCreate = projectResourceInfoRepository.findAll().size();

        // Create the ProjectResourceInfo
        ProjectResourceInfoDTO projectResourceInfoDTO = projectResourceInfoMapper.toDto(projectResourceInfo);
        restProjectResourceInfoMockMvc.perform(post("/api/project-resource-infos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceInfoDTO)))
            .andExpect(status().isCreated());

        // Validate the ProjectResourceInfo in the database
        List<ProjectResourceInfo> projectResourceInfoList = projectResourceInfoRepository.findAll();
        assertThat(projectResourceInfoList).hasSize(databaseSizeBeforeCreate + 1);
        ProjectResourceInfo testProjectResourceInfo = projectResourceInfoList.get(projectResourceInfoList.size() - 1);
        assertThat(testProjectResourceInfo.getStartDate()).isEqualTo(DEFAULT_START_DATE);
        assertThat(testProjectResourceInfo.getDailyRate()).isEqualTo(DEFAULT_DAILY_RATE);
        assertThat(testProjectResourceInfo.getPaymentDelay()).isEqualTo(DEFAULT_PAYMENT_DELAY);
        assertThat(testProjectResourceInfo.getReference()).isEqualTo(DEFAULT_REFERENCE);
    }

    @Test
    @Transactional
    public void createProjectResourceInfoWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = projectResourceInfoRepository.findAll().size();

        // Create the ProjectResourceInfo with an existing ID
        projectResourceInfo.setId(1L);
        ProjectResourceInfoDTO projectResourceInfoDTO = projectResourceInfoMapper.toDto(projectResourceInfo);

        // An entity with an existing ID cannot be created, so this API call must fail
        restProjectResourceInfoMockMvc.perform(post("/api/project-resource-infos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceInfoDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ProjectResourceInfo in the database
        List<ProjectResourceInfo> projectResourceInfoList = projectResourceInfoRepository.findAll();
        assertThat(projectResourceInfoList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkStartDateIsRequired() throws Exception {
        int databaseSizeBeforeTest = projectResourceInfoRepository.findAll().size();
        // set the field null
        projectResourceInfo.setStartDate(null);

        // Create the ProjectResourceInfo, which fails.
        ProjectResourceInfoDTO projectResourceInfoDTO = projectResourceInfoMapper.toDto(projectResourceInfo);

        restProjectResourceInfoMockMvc.perform(post("/api/project-resource-infos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceInfoDTO)))
            .andExpect(status().isBadRequest());

        List<ProjectResourceInfo> projectResourceInfoList = projectResourceInfoRepository.findAll();
        assertThat(projectResourceInfoList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkDailyRateIsRequired() throws Exception {
        int databaseSizeBeforeTest = projectResourceInfoRepository.findAll().size();
        // set the field null
        projectResourceInfo.setDailyRate(null);

        // Create the ProjectResourceInfo, which fails.
        ProjectResourceInfoDTO projectResourceInfoDTO = projectResourceInfoMapper.toDto(projectResourceInfo);

        restProjectResourceInfoMockMvc.perform(post("/api/project-resource-infos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceInfoDTO)))
            .andExpect(status().isBadRequest());

        List<ProjectResourceInfo> projectResourceInfoList = projectResourceInfoRepository.findAll();
        assertThat(projectResourceInfoList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllProjectResourceInfos() throws Exception {
        // Initialize the database
        projectResourceInfoRepository.saveAndFlush(projectResourceInfo);

        // Get all the projectResourceInfoList
        restProjectResourceInfoMockMvc.perform(get("/api/project-resource-infos?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(projectResourceInfo.getId().intValue())))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].dailyRate").value(hasItem(DEFAULT_DAILY_RATE.doubleValue())))
            .andExpect(jsonPath("$.[*].paymentDelay").value(hasItem(DEFAULT_PAYMENT_DELAY)))
            .andExpect(jsonPath("$.[*].reference").value(hasItem(DEFAULT_REFERENCE.toString())));
    }
    
    @Test
    @Transactional
    public void getProjectResourceInfo() throws Exception {
        // Initialize the database
        projectResourceInfoRepository.saveAndFlush(projectResourceInfo);

        // Get the projectResourceInfo
        restProjectResourceInfoMockMvc.perform(get("/api/project-resource-infos/{id}", projectResourceInfo.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(projectResourceInfo.getId().intValue()))
            .andExpect(jsonPath("$.startDate").value(DEFAULT_START_DATE.toString()))
            .andExpect(jsonPath("$.dailyRate").value(DEFAULT_DAILY_RATE.doubleValue()))
            .andExpect(jsonPath("$.paymentDelay").value(DEFAULT_PAYMENT_DELAY))
            .andExpect(jsonPath("$.reference").value(DEFAULT_REFERENCE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingProjectResourceInfo() throws Exception {
        // Get the projectResourceInfo
        restProjectResourceInfoMockMvc.perform(get("/api/project-resource-infos/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateProjectResourceInfo() throws Exception {
        // Initialize the database
        projectResourceInfoRepository.saveAndFlush(projectResourceInfo);

        int databaseSizeBeforeUpdate = projectResourceInfoRepository.findAll().size();

        // Update the projectResourceInfo
        ProjectResourceInfo updatedProjectResourceInfo = projectResourceInfoRepository.findById(projectResourceInfo.getId()).get();
        // Disconnect from session so that the updates on updatedProjectResourceInfo are not directly saved in db
        em.detach(updatedProjectResourceInfo);
        updatedProjectResourceInfo
            .startDate(UPDATED_START_DATE)
            .dailyRate(UPDATED_DAILY_RATE)
            .paymentDelay(UPDATED_PAYMENT_DELAY)
            .reference(UPDATED_REFERENCE);
        ProjectResourceInfoDTO projectResourceInfoDTO = projectResourceInfoMapper.toDto(updatedProjectResourceInfo);

        restProjectResourceInfoMockMvc.perform(put("/api/project-resource-infos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceInfoDTO)))
            .andExpect(status().isOk());

        // Validate the ProjectResourceInfo in the database
        List<ProjectResourceInfo> projectResourceInfoList = projectResourceInfoRepository.findAll();
        assertThat(projectResourceInfoList).hasSize(databaseSizeBeforeUpdate);
        ProjectResourceInfo testProjectResourceInfo = projectResourceInfoList.get(projectResourceInfoList.size() - 1);
        assertThat(testProjectResourceInfo.getStartDate()).isEqualTo(UPDATED_START_DATE);
        assertThat(testProjectResourceInfo.getDailyRate()).isEqualTo(UPDATED_DAILY_RATE);
        assertThat(testProjectResourceInfo.getPaymentDelay()).isEqualTo(UPDATED_PAYMENT_DELAY);
        assertThat(testProjectResourceInfo.getReference()).isEqualTo(UPDATED_REFERENCE);
    }

    @Test
    @Transactional
    public void updateNonExistingProjectResourceInfo() throws Exception {
        int databaseSizeBeforeUpdate = projectResourceInfoRepository.findAll().size();

        // Create the ProjectResourceInfo
        ProjectResourceInfoDTO projectResourceInfoDTO = projectResourceInfoMapper.toDto(projectResourceInfo);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProjectResourceInfoMockMvc.perform(put("/api/project-resource-infos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(projectResourceInfoDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ProjectResourceInfo in the database
        List<ProjectResourceInfo> projectResourceInfoList = projectResourceInfoRepository.findAll();
        assertThat(projectResourceInfoList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteProjectResourceInfo() throws Exception {
        // Initialize the database
        projectResourceInfoRepository.saveAndFlush(projectResourceInfo);

        int databaseSizeBeforeDelete = projectResourceInfoRepository.findAll().size();

        // Delete the projectResourceInfo
        restProjectResourceInfoMockMvc.perform(delete("/api/project-resource-infos/{id}", projectResourceInfo.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ProjectResourceInfo> projectResourceInfoList = projectResourceInfoRepository.findAll();
        assertThat(projectResourceInfoList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProjectResourceInfo.class);
        ProjectResourceInfo projectResourceInfo1 = new ProjectResourceInfo();
        projectResourceInfo1.setId(1L);
        ProjectResourceInfo projectResourceInfo2 = new ProjectResourceInfo();
        projectResourceInfo2.setId(projectResourceInfo1.getId());
        assertThat(projectResourceInfo1).isEqualTo(projectResourceInfo2);
        projectResourceInfo2.setId(2L);
        assertThat(projectResourceInfo1).isNotEqualTo(projectResourceInfo2);
        projectResourceInfo1.setId(null);
        assertThat(projectResourceInfo1).isNotEqualTo(projectResourceInfo2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProjectResourceInfoDTO.class);
        ProjectResourceInfoDTO projectResourceInfoDTO1 = new ProjectResourceInfoDTO();
        projectResourceInfoDTO1.setId(1L);
        ProjectResourceInfoDTO projectResourceInfoDTO2 = new ProjectResourceInfoDTO();
        assertThat(projectResourceInfoDTO1).isNotEqualTo(projectResourceInfoDTO2);
        projectResourceInfoDTO2.setId(projectResourceInfoDTO1.getId());
        assertThat(projectResourceInfoDTO1).isEqualTo(projectResourceInfoDTO2);
        projectResourceInfoDTO2.setId(2L);
        assertThat(projectResourceInfoDTO1).isNotEqualTo(projectResourceInfoDTO2);
        projectResourceInfoDTO1.setId(null);
        assertThat(projectResourceInfoDTO1).isNotEqualTo(projectResourceInfoDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(projectResourceInfoMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(projectResourceInfoMapper.fromId(null)).isNull();
    }
}
