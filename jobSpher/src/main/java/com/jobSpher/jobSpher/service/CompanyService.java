package com.jobSpher.jobSpher.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobSpher.jobSpher.dto.CompanyRequest;
import com.jobSpher.jobSpher.model.Company;
import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.repository.CompanyRepository;

/**
 * Service for company management
 */
@Service
public class CompanyService {
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Transactional
    public Company createCompany(User employer, CompanyRequest request) {
        if (companyRepository.existsByEmployer(employer)) {
            throw new RuntimeException("Company already exists for this employer");
        }
        
        Company company = new Company();
        company.setName(request.getName());
        company.setDescription(request.getDescription());
        company.setIndustry(request.getIndustry());
        company.setWebsite(request.getWebsite());
        company.setAddress(request.getAddress());
        company.setPhoneNumber(request.getPhoneNumber());
        company.setEmployer(employer);
        company.setPaymentVerified(false);
        
        return companyRepository.save(company);
    }
    
    public Company getCompanyByEmployer(User employer) {
        return companyRepository.findByEmployer(employer)
                .orElseThrow(() -> new RuntimeException("Company not found"));
    }
    
    @Transactional
    public Company updateCompany(User employer, CompanyRequest request) {
        Company company = getCompanyByEmployer(employer);
        company.setName(request.getName());
        company.setDescription(request.getDescription());
        company.setIndustry(request.getIndustry());
        company.setWebsite(request.getWebsite());
        company.setAddress(request.getAddress());
        company.setPhoneNumber(request.getPhoneNumber());
        
        return companyRepository.save(company);
    }
    
    @Transactional
    public void setPaymentVerified(Long companyId, boolean verified) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setPaymentVerified(verified);
        companyRepository.save(company);
    }
}

