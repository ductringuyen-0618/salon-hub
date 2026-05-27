package com.salonhub.api.queue.service;

import com.salonhub.api.customer.model.Customer;
import com.salonhub.api.customer.repository.CustomerRepository;
import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.employee.repository.EmployeeRepository;
import com.salonhub.api.queue.dto.QueueEntryDTO;
import com.salonhub.api.queue.dto.QueueUpdateDTO;
import com.salonhub.api.queue.model.Queue;
import com.salonhub.api.queue.model.QueueStatus;
import com.salonhub.api.queue.repository.QueueRepository;
import com.salonhub.api.testfixtures.CustomerDatabaseDefault;
import com.salonhub.api.testfixtures.EmployeeDatabaseDefault;
import com.salonhub.api.testfixtures.QueueTestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QueueServiceImplTest {

    @Mock
    private QueueRepository queueRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private QueueNotificationService notificationService;

    @InjectMocks
    private QueueServiceImpl queueService;

    private Queue queue;
    private QueueUpdateDTO queueUpdateDTO;

    @BeforeEach
    void setUp() {
        queue = QueueTestDataBuilder.aQueueEntry().build();
        queueUpdateDTO = QueueTestDataBuilder.aQueueEntry().buildUpdateDTO();
    }

    @Test
    void addToQueue_shouldSaveQueueEntry() {
        // Given
        given(queueRepository.findMaxQueueNumber()).willReturn(Optional.of(5));
        given(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).willReturn(List.of());
        given(queueRepository.save(any(Queue.class))).willReturn(queue);

        // When
        Queue result = queueService.addToQueue(queue);

        // Then
        assertThat(result).isEqualTo(queue);
        verify(queueRepository).save(queue);
        assertThat(queue.getQueueNumber()).isEqualTo(6);
    }

    @Test
    void addToQueue_shouldSetFirstQueueNumber_whenNoExistingEntries() {
        // Given
        given(queueRepository.findMaxQueueNumber()).willReturn(Optional.empty());
        given(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).willReturn(List.of());
        given(queueRepository.save(any(Queue.class))).willReturn(queue);

        // When
        Queue result = queueService.addToQueue(queue);

        // Then
        assertThat(result).isEqualTo(queue);
        assertThat(queue.getQueueNumber()).isEqualTo(1);
    }

    @Test
    void getCurrentQueue_shouldReturnQueueEntries() {
        // Given
        List<Queue> queueList = List.of(queue);
        given(queueRepository.findCurrentQueue()).willReturn(queueList);
        given(customerRepository.findById(queue.getCustomerId())).willReturn(Optional.of(CustomerDatabaseDefault.JANE));
        given(employeeRepository.findById(queue.getEmployeeId())).willReturn(Optional.of(EmployeeDatabaseDefault.ALICE));

        // When
        List<QueueEntryDTO> result = queueService.getCurrentQueue();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(queue.getId());
        assertThat(result.get(0).getCustomerId()).isEqualTo(queue.getCustomerId());
        assertThat(result.get(0).getCustomerName()).isEqualTo(CustomerDatabaseDefault.JANE.getName());
        assertThat(result.get(0).getEmployeeName()).isEqualTo(EmployeeDatabaseDefault.ALICE.getName());
    }

    @Test
    void getQueueEntry_shouldReturnQueueEntry() {
        // Given
        given(queueRepository.findById(1L)).willReturn(Optional.of(queue));
        given(customerRepository.findById(queue.getCustomerId())).willReturn(Optional.of(CustomerDatabaseDefault.JANE));
        given(employeeRepository.findById(queue.getEmployeeId())).willReturn(Optional.of(EmployeeDatabaseDefault.ALICE));

        // When
        QueueEntryDTO result = queueService.getQueueEntry(1L);

        // Then
        assertThat(result.getId()).isEqualTo(queue.getId());
        assertThat(result.getCustomerId()).isEqualTo(queue.getCustomerId());
        assertThat(result.getCustomerName()).isEqualTo(CustomerDatabaseDefault.JANE.getName());
    }

    @Test
    void getQueueEntry_shouldThrowException_whenNotFound() {
        // Given
        given(queueRepository.findById(1L)).willReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> queueService.getQueueEntry(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Queue entry not found with id: 1");
    }

    @Test
    void updateQueueEntry_shouldUpdateAndReturnEntry() {
        // Given
        given(queueRepository.findById(1L)).willReturn(Optional.of(queue));
        given(queueRepository.save(any(Queue.class))).willReturn(queue);
        given(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).willReturn(List.of());
        given(customerRepository.findById(queue.getCustomerId())).willReturn(Optional.of(CustomerDatabaseDefault.JANE));
        given(employeeRepository.findById(queue.getEmployeeId())).willReturn(Optional.of(EmployeeDatabaseDefault.ALICE));

        // When
        QueueEntryDTO result = queueService.updateQueueEntry(1L, queueUpdateDTO);

        // Then
        assertThat(result.getId()).isEqualTo(queue.getId());
        verify(queueRepository).save(queue);
    }

    @Test
    void updateQueueEntry_shouldThrowException_whenNotFound() {
        // Given
        given(queueRepository.findById(1L)).willReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> queueService.updateQueueEntry(1L, queueUpdateDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Queue entry not found with id: 1");
    }

    @Test
    void removeFromQueue_shouldDeleteEntry() {
        // Given
        given(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).willReturn(List.of());

        // When
        queueService.removeFromQueue(1L);

        // Then
        verify(queueRepository).deleteById(1L);
    }

    @Test
    void updateQueueStatus_shouldUpdateStatusAndReturnEntry() {
        // Given
        given(queueRepository.findById(1L)).willReturn(Optional.of(queue));
        given(queueRepository.save(any(Queue.class))).willReturn(queue);
        given(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).willReturn(List.of());
        given(customerRepository.findById(queue.getCustomerId())).willReturn(Optional.of(CustomerDatabaseDefault.JANE));
        given(employeeRepository.findById(queue.getEmployeeId())).willReturn(Optional.of(EmployeeDatabaseDefault.ALICE));

        // When
        QueueEntryDTO result = queueService.updateQueueStatus(1L, QueueStatus.IN_PROGRESS);

        // Then
        assertThat(result.getId()).isEqualTo(queue.getId());
        assertThat(queue.getStatus()).isEqualTo(QueueStatus.IN_PROGRESS);
        verify(queueRepository).save(queue);
    }

    @Test
    void calculateEstimatedWaitTime_shouldReturnBaseTime_whenNoWaitingCustomers() {
        // Given
        given(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).willReturn(List.of());

        // When
        Integer result = queueService.calculateEstimatedWaitTime();

        // Then
        assertThat(result).isEqualTo(15);
    }

    @Test
    void calculateEstimatedWaitTime_shouldCalculateBasedOnQueueSize() {
        // Given
        List<Queue> waitingCustomers = List.of(queue, queue);
        given(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).willReturn(waitingCustomers);

        // When
        Integer result = queueService.calculateEstimatedWaitTime();

        // Then
        assertThat(result).isEqualTo(60); // 30 minutes per customer * 2 customers
    }

    @Test
    void updateQueuePositions_shouldUpdateAllWaitingCustomers() {
        // Given
        Queue queue1 = QueueTestDataBuilder.aQueueEntry().withId(1L).build();
        Queue queue2 = QueueTestDataBuilder.aQueueEntry().withId(2L).build();
        List<Queue> waitingCustomers = List.of(queue1, queue2);
        given(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).willReturn(waitingCustomers);

        // When
        queueService.updateQueuePositions();

        // Then
        assertThat(queue1.getPosition()).isEqualTo(1);
        assertThat(queue1.getEstimatedWaitTime()).isEqualTo(30);
        assertThat(queue2.getPosition()).isEqualTo(2);
        assertThat(queue2.getEstimatedWaitTime()).isEqualTo(60);
        verify(queueRepository, times(2)).save(any(Queue.class));
    }
}
