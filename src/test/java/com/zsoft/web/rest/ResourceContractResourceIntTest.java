package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ResourceContract;
import com.zsoft.domain.Resource;
import com.zsoft.repository.ResourceContractRepository;
import com.zsoft.service.ResourceContractService;
import com.zsoft.service.dto.ResourceContractDTO;
import com.zsoft.service.mapper.ResourceContractMapper;
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

import com.zsoft.domain.enumeration.ContractType;
/**
 * Test class for the ResourceContractResource REST controller.
 *
 * @see ResourceContractResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ResourceContractResourceIntTest {

    private static final ContractType DEFAULT_TYPE = ContractType.EMPLOYEE;
    private static final ContractType UPDATED_TYPE = ContractType.FREELANCE;

    private static final LocalDate DEFAULT_START_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_START_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final LocalDate DEFAULT_END_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_END_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Float DEFAULT_COMPENSATION = 1F;
    private static final Float UPDATED_COMPENSATION = 2F;

    @Autowired
    private ResourceContractRepository resourceContractRepository;

    @Autowired
    private ResourceContractMapper resourceContractMapper;

    @Autowired
    private ResourceContractService resourceContractService;

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

    private MockMvc restResourceContractMockMvc;

    private ResourceContract resourceContract;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ResourceContractResource resourceContractResource = new ResourceContractResource(resourceContractService);
        this.restResourceContractMockMvc = MockMvcBuilders.standaloneSetup(resourceContractResource)
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
    public static ResourceContract createEntity(EntityManager em) {
        ResourceContract resourceContract = new ResourceContract()
            .type(DEFAULT_TYPE)
            .startDate(DEFAULT_START_DATE)
            .endDate(DEFAULT_END_DATE)
            .compensation(DEFAULT_COMPENSATION);
        // Add required entity
        Resource resource = ResourceResourceIntTest.createEntity(em);
        em.persist(resource);
        em.flush();
        resourceContract.setResource(resource);
        return resourceContract;
    }

    @Before
    public void initTest() {
        resourceContract = createEntity(em);
    }

    @Test
    @Transactional
    public void createResourceContract() throws Exception {
        int databaseSizeBeforeCreate = resourceContractRepository.findAll().size();

        // Create the ResourceContract
        ResourceContractDTO resourceContractDTO = resourceContractMapper.toDto(resourceContract);
        restResourceContractMockMvc.perform(post("/api/resource-contracts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceContractDTO)))
            .andExpect(status().isCreated());

        // Validate the ResourceContract in the database
        List<ResourceContract> resourceContractList = resourceContractRepository.findAll();
        assertThat(resourceContractList).hasSize(databaseSizeBeforeCreate + 1);
        ResourceContract testResourceContract = resourceContractList.get(resourceContractList.size() - 1);
        assertThat(testResourceContract.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testResourceContract.getStartDate()).isEqualTo(DEFAULT_START_DATE);
        assertThat(testResourceContract.getEndDate()).isEqualTo(DEFAULT_END_DATE);
        assertThat(testResourceContract.getCompensation()).isEqualTo(DEFAULT_COMPENSATION);
    }

    @Test
    @Transactional
    public void createResourceContractWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = resourceContractRepository.findAll().size();

        // Create the ResourceContract with an existing ID
        resourceContract.setId(1L);
        ResourceContractDTO resourceContractDTO = resourceContractMapper.toDto(resourceContract);

        // An entity with an existing ID cannot be created, so this API call must fail
        restResourceContractMockMvc.perform(post("/api/resource-contracts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceContractDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ResourceContract in the database
        List<ResourceContract> resourceContractList = resourceContractRepository.findAll();
        assertThat(resourceContractList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = resourceContractRepository.findAll().size();
        // set the field null
        resourceContract.setType(null);

        // Create the ResourceContract, which fails.
        ResourceContractDTO resourceContractDTO = resourceContractMapper.toDto(resourceContract);

        restResourceContractMockMvc.perform(post("/api/resource-contracts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceContractDTO)))
            .andExpect(status().isBadRequest());

        List<ResourceContract> resourceContractList = resourceContractRepository.findAll();
        assertThat(resourceContractList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkStartDateIsRequired() throws Exception {
        int databaseSizeBeforeTest = resourceContractRepository.findAll().size();
        // set the field null
        resourceContract.setStartDate(null);

        // Create the ResourceContract, which fails.
        ResourceContractDTO resourceContractDTO = resourceContractMapper.toDto(resourceContract);

        restResourceContractMockMvc.perform(post("/api/resource-contracts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceContractDTO)))
            .andExpect(status().isBadRequest());

        List<ResourceContract> resourceContractList = resourceContractRepository.findAll();
        assertThat(resourceContractList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllResourceContracts() throws Exception {
        // Initialize the database
        resourceContractRepository.saveAndFlush(resourceContract);

        // Get all the resourceContractList
        restResourceContractMockMvc.perform(get("/api/resource-contracts?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(resourceContract.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())))
            .andExpect(jsonPath("$.[*].compensation").value(hasItem(DEFAULT_COMPENSATION.doubleValue())));
    }
    
    @Test
    @Transactional
    public void getResourceContract() throws Exception {
        // Initialize the database
        resourceContractRepository.saveAndFlush(resourceContract);

        // Get the resourceContract
        restResourceContractMockMvc.perform(get("/api/resource-contracts/{id}", resourceContract.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(resourceContract.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.startDate").value(DEFAULT_START_DATE.toString()))
            .andExpect(jsonPath("$.endDate").value(DEFAULT_END_DATE.toString()))
            .andExpect(jsonPath("$.compensation").value(DEFAULT_COMPENSATION.doubleValue()));
    }

    @Test
    @Transactional
    public void getNonExistingResourceContract() throws Exception {
        // Get the resourceContract
        restResourceContractMockMvc.perform(get("/api/resource-contracts/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateResourceContract() throws Exception {
        // Initialize the database
        resourceContractRepository.saveAndFlush(resourceContract);

        int databaseSizeBeforeUpdate = resourceContractRepository.findAll().size();

        // Update the resourceContract
        ResourceContract updatedResourceContract = resourceContractRepository.findById(resourceContract.getId()).get();
        // Disconnect from session so that the updates on updatedResourceContract are not directly saved in db
        em.detach(updatedResourceContract);
        updatedResourceContract
            .type(UPDATED_TYPE)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .compensation(UPDATED_COMPENSATION);
        ResourceContractDTO resourceContractDTO = resourceContractMapper.toDto(updatedResourceContract);

        restResourceContractMockMvc.perform(put("/api/resource-contracts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceContractDTO)))
            .andExpect(status().isOk());

        // Validate the ResourceContract in the database
        List<ResourceContract> resourceContractList = resourceContractRepository.findAll();
        assertThat(resourceContractList).hasSize(databaseSizeBeforeUpdate);
        ResourceContract testResourceContract = resourceContractList.get(resourceContractList.size() - 1);
        assertThat(testResourceContract.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testResourceContract.getStartDate()).isEqualTo(UPDATED_START_DATE);
        assertThat(testResourceContract.getEndDate()).isEqualTo(UPDATED_END_DATE);
        assertThat(testResourceContract.getCompensation()).isEqualTo(UPDATED_COMPENSATION);
    }

    @Test
    @Transactional
    public void updateNonExistingResourceContract() throws Exception {
        int databaseSizeBeforeUpdate = resourceContractRepository.findAll().size();

        // Create the ResourceContract
        ResourceContractDTO resourceContractDTO = resourceContractMapper.toDto(resourceContract);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restResourceContractMockMvc.perform(put("/api/resource-contracts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceContractDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ResourceContract in the database
        List<ResourceContract> resourceContractList = resourceContractRepository.findAll();
        assertThat(resourceContractList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteResourceContract() throws Exception {
        // Initialize the database
        resourceContractRepository.saveAndFlush(resourceContract);

        int databaseSizeBeforeDelete = resourceContractRepository.findAll().size();

        // Delete the resourceContract
        restResourceContractMockMvc.perform(delete("/api/resource-contracts/{id}", resourceContract.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ResourceContract> resourceContractList = resourceContractRepository.findAll();
        assertThat(resourceContractList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ResourceContract.class);
        ResourceContract resourceContract1 = new ResourceContract();
        resourceContract1.setId(1L);
        ResourceContract resourceContract2 = new ResourceContract();
        resourceContract2.setId(resourceContract1.getId());
        assertThat(resourceContract1).isEqualTo(resourceContract2);
        resourceContract2.setId(2L);
        assertThat(resourceContract1).isNotEqualTo(resourceContract2);
        resourceContract1.setId(null);
        assertThat(resourceContract1).isNotEqualTo(resourceContract2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ResourceContractDTO.class);
        ResourceContractDTO resourceContractDTO1 = new ResourceContractDTO();
        resourceContractDTO1.setId(1L);
        ResourceContractDTO resourceContractDTO2 = new ResourceContractDTO();
        assertThat(resourceContractDTO1).isNotEqualTo(resourceContractDTO2);
        resourceContractDTO2.setId(resourceContractDTO1.getId());
        assertThat(resourceContractDTO1).isEqualTo(resourceContractDTO2);
        resourceContractDTO2.setId(2L);
        assertThat(resourceContractDTO1).isNotEqualTo(resourceContractDTO2);
        resourceContractDTO1.setId(null);
        assertThat(resourceContractDTO1).isNotEqualTo(resourceContractDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(resourceContractMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(resourceContractMapper.fromId(null)).isNull();
    }
}
