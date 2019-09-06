package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.PersistedConfiguration;
import com.zsoft.repository.PersistedConfigurationRepository;
import com.zsoft.service.PersistedConfigurationService;
import com.zsoft.service.dto.PersistedConfigurationDTO;
import com.zsoft.service.mapper.PersistedConfigurationMapper;
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
 * Test class for the PersistedConfigurationResource REST controller.
 *
 * @see PersistedConfigurationResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class PersistedConfigurationResourceIntTest {

    private static final String DEFAULT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    @Autowired
    private PersistedConfigurationRepository persistedConfigurationRepository;

    @Autowired
    private PersistedConfigurationMapper persistedConfigurationMapper;

    @Autowired
    private PersistedConfigurationService persistedConfigurationService;

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

    private MockMvc restPersistedConfigurationMockMvc;

    private PersistedConfiguration persistedConfiguration;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final PersistedConfigurationResource persistedConfigurationResource = new PersistedConfigurationResource(persistedConfigurationService);
        this.restPersistedConfigurationMockMvc = MockMvcBuilders.standaloneSetup(persistedConfigurationResource)
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
    public static PersistedConfiguration createEntity(EntityManager em) {
        PersistedConfiguration persistedConfiguration = new PersistedConfiguration()
            .key(DEFAULT_KEY)
            .value(DEFAULT_VALUE);
        return persistedConfiguration;
    }

    @Before
    public void initTest() {
        persistedConfiguration = createEntity(em);
    }

    @Test
    @Transactional
    public void createPersistedConfiguration() throws Exception {
        int databaseSizeBeforeCreate = persistedConfigurationRepository.findAll().size();

        // Create the PersistedConfiguration
        PersistedConfigurationDTO persistedConfigurationDTO = persistedConfigurationMapper.toDto(persistedConfiguration);
        restPersistedConfigurationMockMvc.perform(post("/api/persisted-configurations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(persistedConfigurationDTO)))
            .andExpect(status().isCreated());

        // Validate the PersistedConfiguration in the database
        List<PersistedConfiguration> persistedConfigurationList = persistedConfigurationRepository.findAll();
        assertThat(persistedConfigurationList).hasSize(databaseSizeBeforeCreate + 1);
        PersistedConfiguration testPersistedConfiguration = persistedConfigurationList.get(persistedConfigurationList.size() - 1);
        assertThat(testPersistedConfiguration.getKey()).isEqualTo(DEFAULT_KEY);
        assertThat(testPersistedConfiguration.getValue()).isEqualTo(DEFAULT_VALUE);
    }

    @Test
    @Transactional
    public void createPersistedConfigurationWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = persistedConfigurationRepository.findAll().size();

        // Create the PersistedConfiguration with an existing ID
        persistedConfiguration.setId(1L);
        PersistedConfigurationDTO persistedConfigurationDTO = persistedConfigurationMapper.toDto(persistedConfiguration);

        // An entity with an existing ID cannot be created, so this API call must fail
        restPersistedConfigurationMockMvc.perform(post("/api/persisted-configurations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(persistedConfigurationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the PersistedConfiguration in the database
        List<PersistedConfiguration> persistedConfigurationList = persistedConfigurationRepository.findAll();
        assertThat(persistedConfigurationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllPersistedConfigurations() throws Exception {
        // Initialize the database
        persistedConfigurationRepository.saveAndFlush(persistedConfiguration);

        // Get all the persistedConfigurationList
        restPersistedConfigurationMockMvc.perform(get("/api/persisted-configurations?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(persistedConfiguration.getId().intValue())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY.toString())))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE.toString())));
    }
    
    @Test
    @Transactional
    public void getPersistedConfiguration() throws Exception {
        // Initialize the database
        persistedConfigurationRepository.saveAndFlush(persistedConfiguration);

        // Get the persistedConfiguration
        restPersistedConfigurationMockMvc.perform(get("/api/persisted-configurations/{id}", persistedConfiguration.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(persistedConfiguration.getId().intValue()))
            .andExpect(jsonPath("$.key").value(DEFAULT_KEY.toString()))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingPersistedConfiguration() throws Exception {
        // Get the persistedConfiguration
        restPersistedConfigurationMockMvc.perform(get("/api/persisted-configurations/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updatePersistedConfiguration() throws Exception {
        // Initialize the database
        persistedConfigurationRepository.saveAndFlush(persistedConfiguration);

        int databaseSizeBeforeUpdate = persistedConfigurationRepository.findAll().size();

        // Update the persistedConfiguration
        PersistedConfiguration updatedPersistedConfiguration = persistedConfigurationRepository.findById(persistedConfiguration.getId()).get();
        // Disconnect from session so that the updates on updatedPersistedConfiguration are not directly saved in db
        em.detach(updatedPersistedConfiguration);
        updatedPersistedConfiguration
            .key(UPDATED_KEY)
            .value(UPDATED_VALUE);
        PersistedConfigurationDTO persistedConfigurationDTO = persistedConfigurationMapper.toDto(updatedPersistedConfiguration);

        restPersistedConfigurationMockMvc.perform(put("/api/persisted-configurations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(persistedConfigurationDTO)))
            .andExpect(status().isOk());

        // Validate the PersistedConfiguration in the database
        List<PersistedConfiguration> persistedConfigurationList = persistedConfigurationRepository.findAll();
        assertThat(persistedConfigurationList).hasSize(databaseSizeBeforeUpdate);
        PersistedConfiguration testPersistedConfiguration = persistedConfigurationList.get(persistedConfigurationList.size() - 1);
        assertThat(testPersistedConfiguration.getKey()).isEqualTo(UPDATED_KEY);
        assertThat(testPersistedConfiguration.getValue()).isEqualTo(UPDATED_VALUE);
    }

    @Test
    @Transactional
    public void updateNonExistingPersistedConfiguration() throws Exception {
        int databaseSizeBeforeUpdate = persistedConfigurationRepository.findAll().size();

        // Create the PersistedConfiguration
        PersistedConfigurationDTO persistedConfigurationDTO = persistedConfigurationMapper.toDto(persistedConfiguration);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPersistedConfigurationMockMvc.perform(put("/api/persisted-configurations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(persistedConfigurationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the PersistedConfiguration in the database
        List<PersistedConfiguration> persistedConfigurationList = persistedConfigurationRepository.findAll();
        assertThat(persistedConfigurationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deletePersistedConfiguration() throws Exception {
        // Initialize the database
        persistedConfigurationRepository.saveAndFlush(persistedConfiguration);

        int databaseSizeBeforeDelete = persistedConfigurationRepository.findAll().size();

        // Delete the persistedConfiguration
        restPersistedConfigurationMockMvc.perform(delete("/api/persisted-configurations/{id}", persistedConfiguration.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<PersistedConfiguration> persistedConfigurationList = persistedConfigurationRepository.findAll();
        assertThat(persistedConfigurationList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PersistedConfiguration.class);
        PersistedConfiguration persistedConfiguration1 = new PersistedConfiguration();
        persistedConfiguration1.setId(1L);
        PersistedConfiguration persistedConfiguration2 = new PersistedConfiguration();
        persistedConfiguration2.setId(persistedConfiguration1.getId());
        assertThat(persistedConfiguration1).isEqualTo(persistedConfiguration2);
        persistedConfiguration2.setId(2L);
        assertThat(persistedConfiguration1).isNotEqualTo(persistedConfiguration2);
        persistedConfiguration1.setId(null);
        assertThat(persistedConfiguration1).isNotEqualTo(persistedConfiguration2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(PersistedConfigurationDTO.class);
        PersistedConfigurationDTO persistedConfigurationDTO1 = new PersistedConfigurationDTO();
        persistedConfigurationDTO1.setId(1L);
        PersistedConfigurationDTO persistedConfigurationDTO2 = new PersistedConfigurationDTO();
        assertThat(persistedConfigurationDTO1).isNotEqualTo(persistedConfigurationDTO2);
        persistedConfigurationDTO2.setId(persistedConfigurationDTO1.getId());
        assertThat(persistedConfigurationDTO1).isEqualTo(persistedConfigurationDTO2);
        persistedConfigurationDTO2.setId(2L);
        assertThat(persistedConfigurationDTO1).isNotEqualTo(persistedConfigurationDTO2);
        persistedConfigurationDTO1.setId(null);
        assertThat(persistedConfigurationDTO1).isNotEqualTo(persistedConfigurationDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(persistedConfigurationMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(persistedConfigurationMapper.fromId(null)).isNull();
    }
}
