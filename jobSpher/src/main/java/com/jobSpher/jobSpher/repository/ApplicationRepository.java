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
    List<Application> findByJobSeeker(User jobSeeker);
    List<Application> findByJob(Job job);
    Optional<Application> findByJobAndJobSeeker(Job job, User jobSeeker);
    boolean existsByJobAndJobSeeker(Job job, User jobSeeker);
}

