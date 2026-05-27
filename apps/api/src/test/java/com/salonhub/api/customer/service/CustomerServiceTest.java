package com.salonhub.api.customer.service;

import com.salonhub.api.customer.model.Customer;
import com.salonhub.api.customer.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository repository;

    @InjectMocks
    private CustomerService service;

    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setName("John Doe");
        testCustomer.setEmail("john@example.com");
        testCustomer.setPhoneNumber("555-1234");
        testCustomer.setGuest(false);
    }

    @Test
    void findAll_shouldReturnAllCustomers() {
        // Given
        Customer customer2 = new Customer();
        customer2.setId(2L);
        customer2.setName("Jane Smith");
        List<Customer> customers = Arrays.asList(testCustomer, customer2);
        when(repository.findAll()).thenReturn(customers);

        // When
        List<Customer> result = service.findAll();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyInAnyOrder(testCustomer, customer2);
        verify(repository).findAll();
    }

    @Test
    void findById_whenCustomerExists_shouldReturnCustomer() {
        // Given
        when(repository.findById(1L)).thenReturn(Optional.of(testCustomer));

        // When
        Optional<Customer> result = service.findById(1L);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(testCustomer);
        verify(repository).findById(1L);
    }

    @Test
    void findById_whenCustomerDoesNotExist_shouldReturnEmpty() {
        // Given
        when(repository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Customer> result = service.findById(999L);

        // Then
        assertThat(result).isEmpty();
        verify(repository).findById(999L);
    }

    @Test
    void findByEmail_whenCustomerExists_shouldReturnCustomer() {
        // Given
        when(repository.findByEmail("john@example.com")).thenReturn(testCustomer);

        // When
        Optional<Customer> result = service.findByEmail("john@example.com");

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("john@example.com");
        verify(repository).findByEmail("john@example.com");
    }

    @Test
    void findByEmail_whenCustomerDoesNotExist_shouldReturnEmpty() {
        // Given
        when(repository.findByEmail("unknown@example.com")).thenReturn(null);

        // When
        Optional<Customer> result = service.findByEmail("unknown@example.com");

        // Then
        assertThat(result).isEmpty();
        verify(repository).findByEmail("unknown@example.com");
    }

    @Test
    void create_shouldSaveAndReturnCustomer() {
        // Given
        Customer newCustomer = new Customer();
        newCustomer.setName("New Customer");
        newCustomer.setEmail("new@example.com");
        
        when(repository.save(newCustomer)).thenReturn(testCustomer);

        // When
        Customer result = service.create(newCustomer);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(repository).save(newCustomer);
    }

    @Test
    void update_whenCustomerExists_shouldUpdateAndReturn() {
        // Given
        Customer updateData = new Customer();
        updateData.setName("Updated Name");
        updateData.setPhoneNumber("555-9999");
        updateData.setNote("Updated note");
        
        when(repository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(repository.save(any(Customer.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        Optional<Customer> result = service.update(1L, updateData);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Updated Name");
        assertThat(result.get().getPhoneNumber()).isEqualTo("555-9999");
        assertThat(result.get().getNote()).isEqualTo("Updated note");
        verify(repository).findById(1L);
        verify(repository).save(testCustomer);
    }

    @Test
    void update_whenCustomerDoesNotExist_shouldReturnEmpty() {
        // Given
        Customer updateData = new Customer();
        when(repository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Customer> result = service.update(999L, updateData);

        // Then
        assertThat(result).isEmpty();
        verify(repository).findById(999L);
        verify(repository, never()).save(any());
    }

    @Test
    void delete_shouldCallRepositoryDelete() {
        // Given
        doNothing().when(repository).deleteById(1L);

        // When
        service.delete(1L);

        // Then
        verify(repository).deleteById(1L);
    }
}
