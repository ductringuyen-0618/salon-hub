package com.salonhub.api.customer.repository;

import com.salonhub.api.customer.model.Customer;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Customer findByEmail(String email);
    @Query("SELECT c FROM Customer c WHERE c.phoneNumber = :value OR c.email = :value")
    Optional<Customer> findByPhoneOrEmail(@Param("value") String phone, @Param("value") String email);

    List<Customer> findAllByGuestTrueAndCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}