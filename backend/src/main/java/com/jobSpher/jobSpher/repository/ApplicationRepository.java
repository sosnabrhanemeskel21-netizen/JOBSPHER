package com.jobSpher.jobSpher.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobSpher.jobSpher.model.Application;
import com.jobSpher.jobSpher.model.Job;
import com.jobSpher.jobSpher.model.User;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"job", "job.company", "job.company.employer", "jobSeeker", "job.approvedBy"})
    List<Application> findByJobSeeker(User jobSeeker);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"job", "job.company", "job.company.employer", "jobSeeker", "job.approvedBy"})
    List<Application> findByJob(Job job);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"job", "job.company", "job.company.employer", "jobSeeker", "job.approvedBy"})
    Optional<Application> findByJobAndJobSeeker(Job job, User jobSeeker);
    boolean existsByJobAndJobSeeker(Job job, User jobSeeker);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"job", "job.company", "jobSeeker"})
    @org.springframework.data.jpa.repository.Query("SELECT a FROM Application a WHERE a.job.company.employer = :employer")
    List<Application> findApplicationsByEmployer(@org.springframework.data.repository.query.Param("employer") User employer);
}

