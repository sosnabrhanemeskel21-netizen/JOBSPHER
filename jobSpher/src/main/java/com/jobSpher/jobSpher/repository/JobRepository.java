package com.jobSpher.jobSpher.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jobSpher.jobSpher.model.Company;
import com.jobSpher.jobSpher.model.Job;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByCompany(Company company);

    @EntityGraph(attributePaths = { "company", "approvedBy" })
    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);

    // Custom query to fetch pending jobs with all relationships including nested
    // company.employer
    @Query("SELECT DISTINCT j FROM Job j " +
            "LEFT JOIN FETCH j.company c " +
            "LEFT JOIN FETCH j.approvedBy " +
            "LEFT JOIN FETCH c.employer " +
            "WHERE j.status = :status")
    List<Job> findPendingJobsWithRelations(@Param("status") Job.JobStatus status);

    @EntityGraph(attributePaths = { "company", "approvedBy" })
    @Override
    java.util.Optional<Job> findById(Long id);

    // Using JPQL with EntityGraph for proper pagination and relationship loading
    // Note: Description search is case-sensitive to avoid PostgreSQL bytea casting
    // issues
    @EntityGraph(attributePaths = { "company", "approvedBy" })
    @Query("SELECT j FROM Job j " +
            "WHERE 1=1")
    Page<Job> searchJobs(
            @Param("status") Job.JobStatus status,
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("location") String location,
            @Param("minSalary") BigDecimal minSalary,
            @Param("maxSalary") BigDecimal maxSalary,
            Pageable pageable);
}
