package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ResourceConfiguration;
import com.zsoft.domain.Resource;
import com.zsoft.repository.ResourceConfigurationRepository;
import com.zsoft.service.ResourceConfigurationService;
import com.zsoft.service.dto.ResourceConfigurationDTO;
import com.zsoft.service.mapper.ResourceConfigurationMapper;
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
import java.util.List;


import static com.zsoft.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the ResourceConfigurationResource REST controller.
 *
 * @see ResourceConfigurationResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ResourceConfigurationResourceIntTest {

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final Boolean DEFAULT_CAN_REPORT_EXPENSES = false;
    private static final Boolean UPDATED_CAN_REPORT_EXPENSES = true;

    private static final Boolean DEFAULT_HAS_RTT = false;
    private static final Boolean UPDATED_HAS_RTT = true;

    private static final Integer DEFAULT_DAYS_CP = 1;
    private static final Integer UPDATED_DAYS_CP = 2;

    private static final Integer DEFAULT_DAYS_RTT = 1;
    private static final Integer UPDATED_DAYS_RTT = 2;

    @Autowired
    private ResourceConfigurationRepository resourceConfigurationRepository;

    @Autowired
    private ResourceConfigurationMapper resourceConfigurationMapper;

    @Autowired
    private ResourceConfigurationService resourceConfigurationService;

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

    private MockMvc restResourceConfigurationMockMvc;

    private ResourceConfiguration resourceConfiguration;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ResourceConfigurationResource resourceConfigurationResource = new ResourceConfigurationResource(resourceConfigurationService);
        this.restResourceConfigurationMockMvc = MockMvcBuilders.standaloneSetup(resourceConfigurationResource)
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
    public static ResourceConfiguration createEntity(EntityManager em) {
        ResourceConfiguration resourceConfiguration = new ResourceConfiguration()
            .active(DEFAULT_ACTIVE)
            .canReportExpenses(DEFAULT_CAN_REPORT_EXPENSES)
            .hasRTT(DEFAULT_HAS_RTT)
            .daysCP(DEFAULT_DAYS_CP)
            .daysRTT(DEFAULT_DAYS_RTT);
        // Add required entity
        Resource resource = ResourceResourceIntTest.createEntity(em);
        em.persist(resource);
        em.flush();
        resourceConfiguration.setResource(resource);
        return resourceConfiguration;
    }

    @Before
    public void initTest() {
        resourceConfiguration = createEntity(em);
    }

    @Test
    @Transactional
    public void createResourceConfiguration() throws Exception {
        int databaseSizeBeforeCreate = resourceConfigurationRepository.findAll().size();

        // Create the ResourceConfiguration
        ResourceConfigurationDTO resourceConfigurationDTO = resourceConfigurationMapper.toDto(resourceConfiguration);
        restResourceConfigurationMockMvc.perform(post("/api/resource-configurations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceConfigurationDTO)))
            .andExpect(status().isCreated());

        // Validate the ResourceConfiguration in the database
        List<ResourceConfiguration> resourceConfigurationList = resourceConfigurationRepository.findAll();
        assertThat(resourceConfigurationList).hasSize(databaseSizeBeforeCreate + 1);
        ResourceConfiguration testResourceConfiguration = resourceConfigurationList.get(resourceConfigurationList.size() - 1);
        assertThat(testResourceConfiguration.isActive()).isEqualTo(DEFAULT_ACTIVE);
        assertThat(testResourceConfiguration.isCanReportExpenses()).isEqualTo(DEFAULT_CAN_REPORT_EXPENSES);
        assertThat(testResourceConfiguration.isHasRTT()).isEqualTo(DEFAULT_HAS_RTT);
        assertThat(testResourceConfiguration.getDaysCP()).isEqualTo(DEFAULT_DAYS_CP);
        assertThat(testResourceConfiguration.getDaysRTT()).isEqualTo(DEFAULT_DAYS_RTT);
    }

    @Test
    @Transactional
    public void createResourceConfigurationWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = resourceConfigurationRepository.findAll().size();

        // Create the ResourceConfiguration with an existing ID
        resourceConfiguration.setId(1L);
        ResourceConfigurationDTO resourceConfigurationDTO = resourceConfigurationMapper.toDto(resourceConfiguration);

        // An entity with an existing ID cannot be created, so this API call must fail
        restResourceConfigurationMockMvc.perform(post("/api/resource-configurations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceConfigurationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ResourceConfiguration in the database
        List<ResourceConfiguration> resourceConfigurationList = resourceConfigurationRepository.findAll();
        assertThat(resourceConfigurationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllResourceConfigurations() throws Exception {
        // Initialize the database
        resourceConfigurationRepository.saveAndFlush(resourceConfiguration);

        // Get all the resourceConfigurationList
        restResourceConfigurationMockMvc.perform(get("/api/resource-configurations?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(resourceConfiguration.getId().intValue())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())))
            .andExpect(jsonPath("$.[*].canReportExpenses").value(hasItem(DEFAULT_CAN_REPORT_EXPENSES.booleanValue())))
            .andExpect(jsonPath("$.[*].hasRTT").value(hasItem(DEFAULT_HAS_RTT.booleanValue())))
            .andExpect(jsonPath("$.[*].daysCP").value(hasItem(DEFAULT_DAYS_CP)))
            .andExpect(jsonPath("$.[*].daysRTT").value(hasItem(DEFAULT_DAYS_RTT)));
    }
    
    @Test
    @Transactional
    public void getResourceConfiguration() throws Exception {
        // Initialize the database
        resourceConfigurationRepository.saveAndFlush(resourceConfiguration);

        // Get the resourceConfiguration
        restResourceConfigurationMockMvc.perform(get("/api/resource-configurations/{id}", resourceConfiguration.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(resourceConfiguration.getId().intValue()))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()))
            .andExpect(jsonPath("$.canReportExpenses").value(DEFAULT_CAN_REPORT_EXPENSES.booleanValue()))
            .andExpect(jsonPath("$.hasRTT").value(DEFAULT_HAS_RTT.booleanValue()))
            .andExpect(jsonPath("$.daysCP").value(DEFAULT_DAYS_CP))
            .andExpect(jsonPath("$.daysRTT").value(DEFAULT_DAYS_RTT));
    }

    @Test
    @Transactional
    public void getNonExistingResourceConfiguration() throws Exception {
        // Get the resourceConfiguration
        restResourceConfigurationMockMvc.perform(get("/api/resource-configurations/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateResourceConfiguration() throws Exception {
        // Initialize the database
        resourceConfigurationRepository.saveAndFlush(resourceConfiguration);

        int databaseSizeBeforeUpdate = resourceConfigurationRepository.findAll().size();

        // Update the resourceConfiguration
        ResourceConfiguration updatedResourceConfiguration = resourceConfigurationRepository.findById(resourceConfiguration.getId()).get();
        // Disconnect from session so that the updates on updatedResourceConfiguration are not directly saved in db
        em.detach(updatedResourceConfiguration);
        updatedResourceConfiguration
            .active(UPDATED_ACTIVE)
            .canReportExpenses(UPDATED_CAN_REPORT_EXPENSES)
            .hasRTT(UPDATED_HAS_RTT)
            .daysCP(UPDATED_DAYS_CP)
            .daysRTT(UPDATED_DAYS_RTT);
        ResourceConfigurationDTO resourceConfigurationDTO = resourceConfigurationMapper.toDto(updatedResourceConfiguration);

        restResourceConfigurationMockMvc.perform(put("/api/resource-configurations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceConfigurationDTO)))
            .andExpect(status().isOk());

        // Validate the ResourceConfiguration in the database
        List<ResourceConfiguration> resourceConfigurationList = resourceConfigurationRepository.findAll();
        assertThat(resourceConfigurationList).hasSize(databaseSizeBeforeUpdate);
        ResourceConfiguration testResourceConfiguration = resourceConfigurationList.get(resourceConfigurationList.size() - 1);
        assertThat(testResourceConfiguration.isActive()).isEqualTo(UPDATED_ACTIVE);
        assertThat(testResourceConfiguration.isCanReportExpenses()).isEqualTo(UPDATED_CAN_REPORT_EXPENSES);
        assertThat(testResourceConfiguration.isHasRTT()).isEqualTo(UPDATED_HAS_RTT);
        assertThat(testResourceConfiguration.getDaysCP()).isEqualTo(UPDATED_DAYS_CP);
        assertThat(testResourceConfiguration.getDaysRTT()).isEqualTo(UPDATED_DAYS_RTT);
    }

    @Test
    @Transactional
    public void updateNonExistingResourceConfiguration() throws Exception {
        int databaseSizeBeforeUpdate = resourceConfigurationRepository.findAll().size();

        // Create the ResourceConfiguration
        ResourceConfigurationDTO resourceConfigurationDTO = resourceConfigurationMapper.toDto(resourceConfiguration);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restResourceConfigurationMockMvc.perform(put("/api/resource-configurations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceConfigurationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ResourceConfiguration in the database
        List<ResourceConfiguration> resourceConfigurationList = resourceConfigurationRepository.findAll();
        assertThat(resourceConfigurationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteResourceConfiguration() throws Exception {
        // Initialize the database
        resourceConfigurationRepository.saveAndFlush(resourceConfiguration);

        int databaseSizeBeforeDelete = resourceConfigurationRepository.findAll().size();

        // Delete the resourceConfiguration
        restResourceConfigurationMockMvc.perform(delete("/api/resource-configurations/{id}", resourceConfiguration.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ResourceConfiguration> resourceConfigurationList = resourceConfigurationRepository.findAll();
        assertThat(resourceConfigurationList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ResourceConfiguration.class);
        ResourceConfiguration resourceConfiguration1 = new ResourceConfiguration();
        resourceConfiguration1.setId(1L);
        ResourceConfiguration resourceConfiguration2 = new ResourceConfiguration();
        resourceConfiguration2.setId(resourceConfiguration1.getId());
        assertThat(resourceConfiguration1).isEqualTo(resourceConfiguration2);
        resourceConfiguration2.setId(2L);
        assertThat(resourceConfiguration1).isNotEqualTo(resourceConfiguration2);
        resourceConfiguration1.setId(null);
        assertThat(resourceConfiguration1).isNotEqualTo(resourceConfiguration2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ResourceConfigurationDTO.class);
        ResourceConfigurationDTO resourceConfigurationDTO1 = new ResourceConfigurationDTO();
        resourceConfigurationDTO1.setId(1L);
        ResourceConfigurationDTO resourceConfigurationDTO2 = new ResourceConfigurationDTO();
        assertThat(resourceConfigurationDTO1).isNotEqualTo(resourceConfigurationDTO2);
        resourceConfigurationDTO2.setId(resourceConfigurationDTO1.getId());
        assertThat(resourceConfigurationDTO1).isEqualTo(resourceConfigurationDTO2);
        resourceConfigurationDTO2.setId(2L);
        assertThat(resourceConfigurationDTO1).isNotEqualTo(resourceConfigurationDTO2);
        resourceConfigurationDTO1.setId(null);
        assertThat(resourceConfigurationDTO1).isNotEqualTo(resourceConfigurationDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(resourceConfigurationMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(resourceConfigurationMapper.fromId(null)).isNull();
    }
}
