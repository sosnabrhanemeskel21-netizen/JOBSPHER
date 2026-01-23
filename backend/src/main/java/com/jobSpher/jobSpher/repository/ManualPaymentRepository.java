package com.jobSpher.jobSpher.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jobSpher.jobSpher.model.ManualPayment;
import com.jobSpher.jobSpher.model.User;

@Repository
public interface ManualPaymentRepository extends JpaRepository<ManualPayment, Long> {
    List<ManualPayment> findByEmployer(User employer);
    
    @Query("SELECT DISTINCT p FROM ManualPayment p LEFT JOIN FETCH p.employer LEFT JOIN FETCH p.verifiedBy WHERE p.status = :status")
    List<ManualPayment> findByStatus(@Param("status") ManualPayment.PaymentStatus status);
    
    Optional<ManualPayment> findFirstByEmployerOrderByUploadDateDesc(User employer);
}

