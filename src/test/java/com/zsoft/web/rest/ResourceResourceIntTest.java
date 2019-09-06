package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.Resource;
import com.zsoft.domain.Company;
import com.zsoft.repository.ResourceRepository;
import com.zsoft.service.ResourceService;
import com.zsoft.service.dto.ResourceDTO;
import com.zsoft.service.mapper.ResourceMapper;
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

import com.zsoft.domain.enumeration.Gender;
/**
 * Test class for the ResourceResource REST controller.
 *
 * @see ResourceResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ResourceResourceIntTest {

    private static final String DEFAULT_IDENTIFICATION = "AAAAAAAAAA";
    private static final String UPDATED_IDENTIFICATION = "BBBBBBBBBB";

    private static final String DEFAULT_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_EMAIL = "BBBBBBBBBB";

    private static final String DEFAULT_SECONDARY_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_SECONDARY_EMAIL = "BBBBBBBBBB";

    private static final String DEFAULT_FIRST_NAME = "AAAAAAAAAA";
    private static final String UPDATED_FIRST_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_LAST_NAME = "AAAAAAAAAA";
    private static final String UPDATED_LAST_NAME = "BBBBBBBBBB";

    private static final Gender DEFAULT_GENDER = Gender.MALE;
    private static final Gender UPDATED_GENDER = Gender.FEMALE;

    private static final LocalDate DEFAULT_DATE_OF_BIRTH = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DATE_OF_BIRTH = LocalDate.now(ZoneId.systemDefault());

    private static final String DEFAULT_SOCIAL_SECURITY = "AAAAAAAAAA";
    private static final String UPDATED_SOCIAL_SECURITY = "BBBBBBBBBB";

    private static final String DEFAULT_PHONE_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_PHONE_NUMBER = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_HIRE_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_HIRE_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final String DEFAULT_COUNTRY_OF_BIRTH = "AAAAAAAAAA";
    private static final String UPDATED_COUNTRY_OF_BIRTH = "BBBBBBBBBB";

    private static final String DEFAULT_TOWN_OF_BIRTH = "AAAAAAAAAA";
    private static final String UPDATED_TOWN_OF_BIRTH = "BBBBBBBBBB";

    private static final String DEFAULT_CITIZEN_SHIP = "AAAAAAAAAA";
    private static final String UPDATED_CITIZEN_SHIP = "BBBBBBBBBB";

    private static final String DEFAULT_WORK_PERMIT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_WORK_PERMIT_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_WORK_PERMIT_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_WORK_PERMIT_NUMBER = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_WORK_PERMIT_EXPIRY_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_WORK_PERMIT_EXPIRY_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final String DEFAULT_ADDRESS_LINE_1 = "AAAAAAAAAA";
    private static final String UPDATED_ADDRESS_LINE_1 = "BBBBBBBBBB";

    private static final String DEFAULT_ADDRESS_LINE_2 = "AAAAAAAAAA";
    private static final String UPDATED_ADDRESS_LINE_2 = "BBBBBBBBBB";

    private static final String DEFAULT_CITY = "AAAAAAAAAA";
    private static final String UPDATED_CITY = "BBBBBBBBBB";

    private static final String DEFAULT_POSTAL_CODE = "AAAAAAAAAA";
    private static final String UPDATED_POSTAL_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_COUNTRY = "AAAAAAAAAA";
    private static final String UPDATED_COUNTRY = "BBBBBBBBBB";

    private static final String DEFAULT_TICKET = "AAAAAAAAAA";
    private static final String UPDATED_TICKET = "BBBBBBBBBB";

    private static final Boolean DEFAULT_DRAFT = false;
    private static final Boolean UPDATED_DRAFT = true;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ResourceMapper resourceMapper;

    @Autowired
    private ResourceService resourceService;

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

    private MockMvc restResourceMockMvc;

    private Resource resource;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ResourceResource resourceResource = new ResourceResource(resourceService);
        this.restResourceMockMvc = MockMvcBuilders.standaloneSetup(resourceResource)
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
    public static Resource createEntity(EntityManager em) {
        Resource resource = new Resource()
            .identification(DEFAULT_IDENTIFICATION)
            .email(DEFAULT_EMAIL)
            .secondaryEmail(DEFAULT_SECONDARY_EMAIL)
            .firstName(DEFAULT_FIRST_NAME)
            .lastName(DEFAULT_LAST_NAME)
            .gender(DEFAULT_GENDER)
            .dateOfBirth(DEFAULT_DATE_OF_BIRTH)
            .socialSecurity(DEFAULT_SOCIAL_SECURITY)
            .phoneNumber(DEFAULT_PHONE_NUMBER)
            .hireDate(DEFAULT_HIRE_DATE)
            .countryOfBirth(DEFAULT_COUNTRY_OF_BIRTH)
            .townOfBirth(DEFAULT_TOWN_OF_BIRTH)
            .citizenShip(DEFAULT_CITIZEN_SHIP)
            .workPermitType(DEFAULT_WORK_PERMIT_TYPE)
            .workPermitNumber(DEFAULT_WORK_PERMIT_NUMBER)
            .workPermitExpiryDate(DEFAULT_WORK_PERMIT_EXPIRY_DATE)
            .addressLine1(DEFAULT_ADDRESS_LINE_1)
            .addressLine2(DEFAULT_ADDRESS_LINE_2)
            .city(DEFAULT_CITY)
            .postalCode(DEFAULT_POSTAL_CODE)
            .country(DEFAULT_COUNTRY)
            .ticket(DEFAULT_TICKET)
            .draft(DEFAULT_DRAFT);
        // Add required entity
        Company company = CompanyResourceIntTest.createEntity(em);
        em.persist(company);
        em.flush();
        resource.setCompany(company);
        return resource;
    }

    @Before
    public void initTest() {
        resource = createEntity(em);
    }

    @Test
    @Transactional
    public void createResource() throws Exception {
        int databaseSizeBeforeCreate = resourceRepository.findAll().size();

        // Create the Resource
        ResourceDTO resourceDTO = resourceMapper.toDto(resource);
        restResourceMockMvc.perform(post("/api/resources")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceDTO)))
            .andExpect(status().isCreated());

        // Validate the Resource in the database
        List<Resource> resourceList = resourceRepository.findAll();
        assertThat(resourceList).hasSize(databaseSizeBeforeCreate + 1);
        Resource testResource = resourceList.get(resourceList.size() - 1);
        assertThat(testResource.getIdentification()).isEqualTo(DEFAULT_IDENTIFICATION);
        assertThat(testResource.getEmail()).isEqualTo(DEFAULT_EMAIL);
        assertThat(testResource.getSecondaryEmail()).isEqualTo(DEFAULT_SECONDARY_EMAIL);
        assertThat(testResource.getFirstName()).isEqualTo(DEFAULT_FIRST_NAME);
        assertThat(testResource.getLastName()).isEqualTo(DEFAULT_LAST_NAME);
        assertThat(testResource.getGender()).isEqualTo(DEFAULT_GENDER);
        assertThat(testResource.getDateOfBirth()).isEqualTo(DEFAULT_DATE_OF_BIRTH);
        assertThat(testResource.getSocialSecurity()).isEqualTo(DEFAULT_SOCIAL_SECURITY);
        assertThat(testResource.getPhoneNumber()).isEqualTo(DEFAULT_PHONE_NUMBER);
        assertThat(testResource.getHireDate()).isEqualTo(DEFAULT_HIRE_DATE);
        assertThat(testResource.getCountryOfBirth()).isEqualTo(DEFAULT_COUNTRY_OF_BIRTH);
        assertThat(testResource.getTownOfBirth()).isEqualTo(DEFAULT_TOWN_OF_BIRTH);
        assertThat(testResource.getCitizenShip()).isEqualTo(DEFAULT_CITIZEN_SHIP);
        assertThat(testResource.getWorkPermitType()).isEqualTo(DEFAULT_WORK_PERMIT_TYPE);
        assertThat(testResource.getWorkPermitNumber()).isEqualTo(DEFAULT_WORK_PERMIT_NUMBER);
        assertThat(testResource.getWorkPermitExpiryDate()).isEqualTo(DEFAULT_WORK_PERMIT_EXPIRY_DATE);
        assertThat(testResource.getAddressLine1()).isEqualTo(DEFAULT_ADDRESS_LINE_1);
        assertThat(testResource.getAddressLine2()).isEqualTo(DEFAULT_ADDRESS_LINE_2);
        assertThat(testResource.getCity()).isEqualTo(DEFAULT_CITY);
        assertThat(testResource.getPostalCode()).isEqualTo(DEFAULT_POSTAL_CODE);
        assertThat(testResource.getCountry()).isEqualTo(DEFAULT_COUNTRY);
        assertThat(testResource.getTicket()).isEqualTo(DEFAULT_TICKET);
        assertThat(testResource.isDraft()).isEqualTo(DEFAULT_DRAFT);
    }

    @Test
    @Transactional
    public void createResourceWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = resourceRepository.findAll().size();

        // Create the Resource with an existing ID
        resource.setId(1L);
        ResourceDTO resourceDTO = resourceMapper.toDto(resource);

        // An entity with an existing ID cannot be created, so this API call must fail
        restResourceMockMvc.perform(post("/api/resources")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Resource in the database
        List<Resource> resourceList = resourceRepository.findAll();
        assertThat(resourceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkEmailIsRequired() throws Exception {
        int databaseSizeBeforeTest = resourceRepository.findAll().size();
        // set the field null
        resource.setEmail(null);

        // Create the Resource, which fails.
        ResourceDTO resourceDTO = resourceMapper.toDto(resource);

        restResourceMockMvc.perform(post("/api/resources")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceDTO)))
            .andExpect(status().isBadRequest());

        List<Resource> resourceList = resourceRepository.findAll();
        assertThat(resourceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllResources() throws Exception {
        // Initialize the database
        resourceRepository.saveAndFlush(resource);

        // Get all the resourceList
        restResourceMockMvc.perform(get("/api/resources?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(resource.getId().intValue())))
            .andExpect(jsonPath("$.[*].identification").value(hasItem(DEFAULT_IDENTIFICATION.toString())))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL.toString())))
            .andExpect(jsonPath("$.[*].secondaryEmail").value(hasItem(DEFAULT_SECONDARY_EMAIL.toString())))
            .andExpect(jsonPath("$.[*].firstName").value(hasItem(DEFAULT_FIRST_NAME.toString())))
            .andExpect(jsonPath("$.[*].lastName").value(hasItem(DEFAULT_LAST_NAME.toString())))
            .andExpect(jsonPath("$.[*].gender").value(hasItem(DEFAULT_GENDER.toString())))
            .andExpect(jsonPath("$.[*].dateOfBirth").value(hasItem(DEFAULT_DATE_OF_BIRTH.toString())))
            .andExpect(jsonPath("$.[*].socialSecurity").value(hasItem(DEFAULT_SOCIAL_SECURITY.toString())))
            .andExpect(jsonPath("$.[*].phoneNumber").value(hasItem(DEFAULT_PHONE_NUMBER.toString())))
            .andExpect(jsonPath("$.[*].hireDate").value(hasItem(DEFAULT_HIRE_DATE.toString())))
            .andExpect(jsonPath("$.[*].countryOfBirth").value(hasItem(DEFAULT_COUNTRY_OF_BIRTH.toString())))
            .andExpect(jsonPath("$.[*].townOfBirth").value(hasItem(DEFAULT_TOWN_OF_BIRTH.toString())))
            .andExpect(jsonPath("$.[*].citizenShip").value(hasItem(DEFAULT_CITIZEN_SHIP.toString())))
            .andExpect(jsonPath("$.[*].workPermitType").value(hasItem(DEFAULT_WORK_PERMIT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].workPermitNumber").value(hasItem(DEFAULT_WORK_PERMIT_NUMBER.toString())))
            .andExpect(jsonPath("$.[*].workPermitExpiryDate").value(hasItem(DEFAULT_WORK_PERMIT_EXPIRY_DATE.toString())))
            .andExpect(jsonPath("$.[*].addressLine1").value(hasItem(DEFAULT_ADDRESS_LINE_1.toString())))
            .andExpect(jsonPath("$.[*].addressLine2").value(hasItem(DEFAULT_ADDRESS_LINE_2.toString())))
            .andExpect(jsonPath("$.[*].city").value(hasItem(DEFAULT_CITY.toString())))
            .andExpect(jsonPath("$.[*].postalCode").value(hasItem(DEFAULT_POSTAL_CODE.toString())))
            .andExpect(jsonPath("$.[*].country").value(hasItem(DEFAULT_COUNTRY.toString())))
            .andExpect(jsonPath("$.[*].ticket").value(hasItem(DEFAULT_TICKET.toString())))
            .andExpect(jsonPath("$.[*].draft").value(hasItem(DEFAULT_DRAFT.booleanValue())));
    }
    
    @Test
    @Transactional
    public void getResource() throws Exception {
        // Initialize the database
        resourceRepository.saveAndFlush(resource);

        // Get the resource
        restResourceMockMvc.perform(get("/api/resources/{id}", resource.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(resource.getId().intValue()))
            .andExpect(jsonPath("$.identification").value(DEFAULT_IDENTIFICATION.toString()))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL.toString()))
            .andExpect(jsonPath("$.secondaryEmail").value(DEFAULT_SECONDARY_EMAIL.toString()))
            .andExpect(jsonPath("$.firstName").value(DEFAULT_FIRST_NAME.toString()))
            .andExpect(jsonPath("$.lastName").value(DEFAULT_LAST_NAME.toString()))
            .andExpect(jsonPath("$.gender").value(DEFAULT_GENDER.toString()))
            .andExpect(jsonPath("$.dateOfBirth").value(DEFAULT_DATE_OF_BIRTH.toString()))
            .andExpect(jsonPath("$.socialSecurity").value(DEFAULT_SOCIAL_SECURITY.toString()))
            .andExpect(jsonPath("$.phoneNumber").value(DEFAULT_PHONE_NUMBER.toString()))
            .andExpect(jsonPath("$.hireDate").value(DEFAULT_HIRE_DATE.toString()))
            .andExpect(jsonPath("$.countryOfBirth").value(DEFAULT_COUNTRY_OF_BIRTH.toString()))
            .andExpect(jsonPath("$.townOfBirth").value(DEFAULT_TOWN_OF_BIRTH.toString()))
            .andExpect(jsonPath("$.citizenShip").value(DEFAULT_CITIZEN_SHIP.toString()))
            .andExpect(jsonPath("$.workPermitType").value(DEFAULT_WORK_PERMIT_TYPE.toString()))
            .andExpect(jsonPath("$.workPermitNumber").value(DEFAULT_WORK_PERMIT_NUMBER.toString()))
            .andExpect(jsonPath("$.workPermitExpiryDate").value(DEFAULT_WORK_PERMIT_EXPIRY_DATE.toString()))
            .andExpect(jsonPath("$.addressLine1").value(DEFAULT_ADDRESS_LINE_1.toString()))
            .andExpect(jsonPath("$.addressLine2").value(DEFAULT_ADDRESS_LINE_2.toString()))
            .andExpect(jsonPath("$.city").value(DEFAULT_CITY.toString()))
            .andExpect(jsonPath("$.postalCode").value(DEFAULT_POSTAL_CODE.toString()))
            .andExpect(jsonPath("$.country").value(DEFAULT_COUNTRY.toString()))
            .andExpect(jsonPath("$.ticket").value(DEFAULT_TICKET.toString()))
            .andExpect(jsonPath("$.draft").value(DEFAULT_DRAFT.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingResource() throws Exception {
        // Get the resource
        restResourceMockMvc.perform(get("/api/resources/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateResource() throws Exception {
        // Initialize the database
        resourceRepository.saveAndFlush(resource);

        int databaseSizeBeforeUpdate = resourceRepository.findAll().size();

        // Update the resource
        Resource updatedResource = resourceRepository.findById(resource.getId()).get();
        // Disconnect from session so that the updates on updatedResource are not directly saved in db
        em.detach(updatedResource);
        updatedResource
            .identification(UPDATED_IDENTIFICATION)
            .email(UPDATED_EMAIL)
            .secondaryEmail(UPDATED_SECONDARY_EMAIL)
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .gender(UPDATED_GENDER)
            .dateOfBirth(UPDATED_DATE_OF_BIRTH)
            .socialSecurity(UPDATED_SOCIAL_SECURITY)
            .phoneNumber(UPDATED_PHONE_NUMBER)
            .hireDate(UPDATED_HIRE_DATE)
            .countryOfBirth(UPDATED_COUNTRY_OF_BIRTH)
            .townOfBirth(UPDATED_TOWN_OF_BIRTH)
            .citizenShip(UPDATED_CITIZEN_SHIP)
            .workPermitType(UPDATED_WORK_PERMIT_TYPE)
            .workPermitNumber(UPDATED_WORK_PERMIT_NUMBER)
            .workPermitExpiryDate(UPDATED_WORK_PERMIT_EXPIRY_DATE)
            .addressLine1(UPDATED_ADDRESS_LINE_1)
            .addressLine2(UPDATED_ADDRESS_LINE_2)
            .city(UPDATED_CITY)
            .postalCode(UPDATED_POSTAL_CODE)
            .country(UPDATED_COUNTRY)
            .ticket(UPDATED_TICKET)
            .draft(UPDATED_DRAFT);
        ResourceDTO resourceDTO = resourceMapper.toDto(updatedResource);

        restResourceMockMvc.perform(put("/api/resources")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceDTO)))
            .andExpect(status().isOk());

        // Validate the Resource in the database
        List<Resource> resourceList = resourceRepository.findAll();
        assertThat(resourceList).hasSize(databaseSizeBeforeUpdate);
        Resource testResource = resourceList.get(resourceList.size() - 1);
        assertThat(testResource.getIdentification()).isEqualTo(UPDATED_IDENTIFICATION);
        assertThat(testResource.getEmail()).isEqualTo(UPDATED_EMAIL);
        assertThat(testResource.getSecondaryEmail()).isEqualTo(UPDATED_SECONDARY_EMAIL);
        assertThat(testResource.getFirstName()).isEqualTo(UPDATED_FIRST_NAME);
        assertThat(testResource.getLastName()).isEqualTo(UPDATED_LAST_NAME);
        assertThat(testResource.getGender()).isEqualTo(UPDATED_GENDER);
        assertThat(testResource.getDateOfBirth()).isEqualTo(UPDATED_DATE_OF_BIRTH);
        assertThat(testResource.getSocialSecurity()).isEqualTo(UPDATED_SOCIAL_SECURITY);
        assertThat(testResource.getPhoneNumber()).isEqualTo(UPDATED_PHONE_NUMBER);
        assertThat(testResource.getHireDate()).isEqualTo(UPDATED_HIRE_DATE);
        assertThat(testResource.getCountryOfBirth()).isEqualTo(UPDATED_COUNTRY_OF_BIRTH);
        assertThat(testResource.getTownOfBirth()).isEqualTo(UPDATED_TOWN_OF_BIRTH);
        assertThat(testResource.getCitizenShip()).isEqualTo(UPDATED_CITIZEN_SHIP);
        assertThat(testResource.getWorkPermitType()).isEqualTo(UPDATED_WORK_PERMIT_TYPE);
        assertThat(testResource.getWorkPermitNumber()).isEqualTo(UPDATED_WORK_PERMIT_NUMBER);
        assertThat(testResource.getWorkPermitExpiryDate()).isEqualTo(UPDATED_WORK_PERMIT_EXPIRY_DATE);
        assertThat(testResource.getAddressLine1()).isEqualTo(UPDATED_ADDRESS_LINE_1);
        assertThat(testResource.getAddressLine2()).isEqualTo(UPDATED_ADDRESS_LINE_2);
        assertThat(testResource.getCity()).isEqualTo(UPDATED_CITY);
        assertThat(testResource.getPostalCode()).isEqualTo(UPDATED_POSTAL_CODE);
        assertThat(testResource.getCountry()).isEqualTo(UPDATED_COUNTRY);
        assertThat(testResource.getTicket()).isEqualTo(UPDATED_TICKET);
        assertThat(testResource.isDraft()).isEqualTo(UPDATED_DRAFT);
    }

    @Test
    @Transactional
    public void updateNonExistingResource() throws Exception {
        int databaseSizeBeforeUpdate = resourceRepository.findAll().size();

        // Create the Resource
        ResourceDTO resourceDTO = resourceMapper.toDto(resource);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restResourceMockMvc.perform(put("/api/resources")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(resourceDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Resource in the database
        List<Resource> resourceList = resourceRepository.findAll();
        assertThat(resourceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteResource() throws Exception {
        // Initialize the database
        resourceRepository.saveAndFlush(resource);

        int databaseSizeBeforeDelete = resourceRepository.findAll().size();

        // Delete the resource
        restResourceMockMvc.perform(delete("/api/resources/{id}", resource.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Resource> resourceList = resourceRepository.findAll();
        assertThat(resourceList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Resource.class);
        Resource resource1 = new Resource();
        resource1.setId(1L);
        Resource resource2 = new Resource();
        resource2.setId(resource1.getId());
        assertThat(resource1).isEqualTo(resource2);
        resource2.setId(2L);
        assertThat(resource1).isNotEqualTo(resource2);
        resource1.setId(null);
        assertThat(resource1).isNotEqualTo(resource2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ResourceDTO.class);
        ResourceDTO resourceDTO1 = new ResourceDTO();
        resourceDTO1.setId(1L);
        ResourceDTO resourceDTO2 = new ResourceDTO();
        assertThat(resourceDTO1).isNotEqualTo(resourceDTO2);
        resourceDTO2.setId(resourceDTO1.getId());
        assertThat(resourceDTO1).isEqualTo(resourceDTO2);
        resourceDTO2.setId(2L);
        assertThat(resourceDTO1).isNotEqualTo(resourceDTO2);
        resourceDTO1.setId(null);
        assertThat(resourceDTO1).isNotEqualTo(resourceDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(resourceMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(resourceMapper.fromId(null)).isNull();
    }
}
