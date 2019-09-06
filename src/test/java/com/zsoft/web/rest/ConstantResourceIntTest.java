package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.Constant;
import com.zsoft.repository.ConstantRepository;
import com.zsoft.service.ConstantService;
import com.zsoft.service.dto.ConstantDTO;
import com.zsoft.service.mapper.ConstantMapper;
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
 * Test class for the ConstantResource REST controller.
 *
 * @see ConstantResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ConstantResourceIntTest {

    private static final String DEFAULT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    @Autowired
    private ConstantRepository constantRepository;

    @Autowired
    private ConstantMapper constantMapper;

    @Autowired
    private ConstantService constantService;

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

    private MockMvc restConstantMockMvc;

    private Constant constant;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ConstantResource constantResource = new ConstantResource(constantService);
        this.restConstantMockMvc = MockMvcBuilders.standaloneSetup(constantResource)
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
    public static Constant createEntity(EntityManager em) {
        Constant constant = new Constant()
            .key(DEFAULT_KEY)
            .value(DEFAULT_VALUE);
        return constant;
    }

    @Before
    public void initTest() {
        constant = createEntity(em);
    }

    @Test
    @Transactional
    public void createConstant() throws Exception {
        int databaseSizeBeforeCreate = constantRepository.findAll().size();

        // Create the Constant
        ConstantDTO constantDTO = constantMapper.toDto(constant);
        restConstantMockMvc.perform(post("/api/constants")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(constantDTO)))
            .andExpect(status().isCreated());

        // Validate the Constant in the database
        List<Constant> constantList = constantRepository.findAll();
        assertThat(constantList).hasSize(databaseSizeBeforeCreate + 1);
        Constant testConstant = constantList.get(constantList.size() - 1);
        assertThat(testConstant.getKey()).isEqualTo(DEFAULT_KEY);
        assertThat(testConstant.getValue()).isEqualTo(DEFAULT_VALUE);
    }

    @Test
    @Transactional
    public void createConstantWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = constantRepository.findAll().size();

        // Create the Constant with an existing ID
        constant.setId(1L);
        ConstantDTO constantDTO = constantMapper.toDto(constant);

        // An entity with an existing ID cannot be created, so this API call must fail
        restConstantMockMvc.perform(post("/api/constants")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(constantDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Constant in the database
        List<Constant> constantList = constantRepository.findAll();
        assertThat(constantList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkKeyIsRequired() throws Exception {
        int databaseSizeBeforeTest = constantRepository.findAll().size();
        // set the field null
        constant.setKey(null);

        // Create the Constant, which fails.
        ConstantDTO constantDTO = constantMapper.toDto(constant);

        restConstantMockMvc.perform(post("/api/constants")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(constantDTO)))
            .andExpect(status().isBadRequest());

        List<Constant> constantList = constantRepository.findAll();
        assertThat(constantList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkValueIsRequired() throws Exception {
        int databaseSizeBeforeTest = constantRepository.findAll().size();
        // set the field null
        constant.setValue(null);

        // Create the Constant, which fails.
        ConstantDTO constantDTO = constantMapper.toDto(constant);

        restConstantMockMvc.perform(post("/api/constants")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(constantDTO)))
            .andExpect(status().isBadRequest());

        List<Constant> constantList = constantRepository.findAll();
        assertThat(constantList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllConstants() throws Exception {
        // Initialize the database
        constantRepository.saveAndFlush(constant);

        // Get all the constantList
        restConstantMockMvc.perform(get("/api/constants?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(constant.getId().intValue())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY.toString())))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE.toString())));
    }
    
    @Test
    @Transactional
    public void getConstant() throws Exception {
        // Initialize the database
        constantRepository.saveAndFlush(constant);

        // Get the constant
        restConstantMockMvc.perform(get("/api/constants/{id}", constant.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(constant.getId().intValue()))
            .andExpect(jsonPath("$.key").value(DEFAULT_KEY.toString()))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingConstant() throws Exception {
        // Get the constant
        restConstantMockMvc.perform(get("/api/constants/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateConstant() throws Exception {
        // Initialize the database
        constantRepository.saveAndFlush(constant);

        int databaseSizeBeforeUpdate = constantRepository.findAll().size();

        // Update the constant
        Constant updatedConstant = constantRepository.findById(constant.getId()).get();
        // Disconnect from session so that the updates on updatedConstant are not directly saved in db
        em.detach(updatedConstant);
        updatedConstant
            .key(UPDATED_KEY)
            .value(UPDATED_VALUE);
        ConstantDTO constantDTO = constantMapper.toDto(updatedConstant);

        restConstantMockMvc.perform(put("/api/constants")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(constantDTO)))
            .andExpect(status().isOk());

        // Validate the Constant in the database
        List<Constant> constantList = constantRepository.findAll();
        assertThat(constantList).hasSize(databaseSizeBeforeUpdate);
        Constant testConstant = constantList.get(constantList.size() - 1);
        assertThat(testConstant.getKey()).isEqualTo(UPDATED_KEY);
        assertThat(testConstant.getValue()).isEqualTo(UPDATED_VALUE);
    }

    @Test
    @Transactional
    public void updateNonExistingConstant() throws Exception {
        int databaseSizeBeforeUpdate = constantRepository.findAll().size();

        // Create the Constant
        ConstantDTO constantDTO = constantMapper.toDto(constant);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restConstantMockMvc.perform(put("/api/constants")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(constantDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Constant in the database
        List<Constant> constantList = constantRepository.findAll();
        assertThat(constantList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteConstant() throws Exception {
        // Initialize the database
        constantRepository.saveAndFlush(constant);

        int databaseSizeBeforeDelete = constantRepository.findAll().size();

        // Delete the constant
        restConstantMockMvc.perform(delete("/api/constants/{id}", constant.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Constant> constantList = constantRepository.findAll();
        assertThat(constantList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Constant.class);
        Constant constant1 = new Constant();
        constant1.setId(1L);
        Constant constant2 = new Constant();
        constant2.setId(constant1.getId());
        assertThat(constant1).isEqualTo(constant2);
        constant2.setId(2L);
        assertThat(constant1).isNotEqualTo(constant2);
        constant1.setId(null);
        assertThat(constant1).isNotEqualTo(constant2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ConstantDTO.class);
        ConstantDTO constantDTO1 = new ConstantDTO();
        constantDTO1.setId(1L);
        ConstantDTO constantDTO2 = new ConstantDTO();
        assertThat(constantDTO1).isNotEqualTo(constantDTO2);
        constantDTO2.setId(constantDTO1.getId());
        assertThat(constantDTO1).isEqualTo(constantDTO2);
        constantDTO2.setId(2L);
        assertThat(constantDTO1).isNotEqualTo(constantDTO2);
        constantDTO1.setId(null);
        assertThat(constantDTO1).isNotEqualTo(constantDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(constantMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(constantMapper.fromId(null)).isNull();
    }
}
