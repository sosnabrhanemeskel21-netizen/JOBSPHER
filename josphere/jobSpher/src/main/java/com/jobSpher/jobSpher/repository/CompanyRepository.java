package com.jobSpher.jobSpher.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobSpher.jobSpher.model.Company;
import com.jobSpher.jobSpher.model.User;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByEmployer(User employer);
    boolean existsByEmployer(User employer);
}

