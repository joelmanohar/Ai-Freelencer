package com.freelancehub.service;

import com.freelancehub.model.*;
import com.freelancehub.repository.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class DataSeederService {
    private static final Logger logger = LoggerFactory.getLogger(DataSeederService.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProjectRepository projectRepository;
    private final ProposalRepository proposalRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeederService(UserRepository userRepository,
                             CategoryRepository categoryRepository,
                             ProjectRepository projectRepository,
                             ProposalRepository proposalRepository,
                             PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.projectRepository = projectRepository;
        this.proposalRepository = proposalRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seedInitialData() {
        try {
            seedCategories();
            seedUsersAndProjects();
        } catch (Exception e) {
            logger.error("Error during initial data seeding: {}", e.getMessage());
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> categories = Arrays.asList(
                    new Category("Data Science & Analytics", "Machine learning, data analysis, and visualization", "BarChart2"),
                    new Category("Design & Creative", "UI/UX, graphic design, and branding", "Palette"),
                    new Category("DevOps & Cloud", "CI/CD, cloud infrastructure, and deployment", "Server"),
                    new Category("Digital Marketing", "SEO, social media, and marketing strategy", "TrendingUp"),
                    new Category("Mobile Development", "iOS and Android app development", "Smartphone"),
                    new Category("Video & Animation", "Video editing, motion graphics, and animation", "Video"),
                    new Category("Web Development", "Websites, web apps, and backend development", "Code"),
                    new Category("Writing & Translation", "Content writing, copywriting, and translation", "FileText")
            );
            categoryRepository.saveAll(categories);
            logger.info("Seeded {} categories into MongoDB", categories.size());
        }
    }

    private void seedUsersAndProjects() {
        // Seed Client
        User client = userRepository.findByEmail("client@demo.com").orElseGet(() -> {
            User u = new User("client@demo.com", passwordEncoder.encode("demo1234"), "Demo Client", "CLIENT");
            u.setTitle("Product Director");
            u.setBio("Looking for passionate freelancers to collaborate on cutting-edge software products.");
            u.setLocation("San Francisco, CA");
            return userRepository.save(u);
        });

        // Seed Freelancer
        User freelancer = userRepository.findByEmail("freelancer@demo.com").orElseGet(() -> {
            User u = new User("freelancer@demo.com", passwordEncoder.encode("demo1234"), "Demo Freelancer", "FREELANCER");
            u.setTitle("Full Stack Developer");
            u.setBio("Experienced full-stack developer specializing in React, Node.js, and cloud architecture. 5+ years building production web apps.");
            u.setLocation("Remote");
            u.setHourlyRate(65.0);
            u.setExperienceLevel("Expert");
            u.setSkills(Arrays.asList("React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker"));
            u.setRating(4.9);
            u.setReviewCount(14);
            return userRepository.save(u);
        });

        // Seed Admin
        userRepository.findByEmail("admin@demo.com").orElseGet(() -> {
            User u = new User("admin@demo.com", passwordEncoder.encode("demo1234"), "Demo Admin", "ADMIN");
            u.setTitle("Platform Administrator");
            u.setBio("FreelanceHub System Administrator.");
            u.setLocation("Headquarters");
            return userRepository.save(u);
        });

        // Seed 2 Demo Projects if empty
        if (projectRepository.count() == 0) {
            Category webCat = categoryRepository.findByName("Web Development").orElse(null);
            Category designCat = categoryRepository.findByName("Design & Creative").orElse(null);

            Project p1 = new Project();
            p1.setClientId(client.getId());
            p1.setClientName(client.getDisplayName());
            p1.setCategoryId(webCat != null ? webCat.getId() : "");
            p1.setCategoryName(webCat != null ? webCat.getName() : "Web Development");
            p1.setTitle("Build a Modern E-commerce Website");
            p1.setDescription("I need a full-featured e-commerce website with product catalog, shopping cart, checkout, and admin dashboard. The site should be built with React and have a clean, modern design. Payment integration with Stripe is required.");
            p1.setBudget(5000.0);
            p1.setDeadline("Dec 31, 2026");
            p1.setExperienceLevel("Expert");
            p1.setSkills(Arrays.asList("React", "TypeScript", "Stripe", "PostgreSQL"));
            p1.setStatus("open");
            Project savedP1 = projectRepository.save(p1);

            Project p2 = new Project();
            p2.setClientId(client.getId());
            p2.setClientName(client.getDisplayName());
            p2.setCategoryId(designCat != null ? designCat.getId() : "");
            p2.setCategoryName(designCat != null ? designCat.getName() : "Design & Creative");
            p2.setTitle("Mobile App UI/UX Design");
            p2.setDescription("Looking for a designer to create beautiful UI/UX for a fitness tracking mobile app. Need wireframes, high-fidelity mockups, and a design system. ~15 screens.");
            p2.setBudget(2500.0);
            p2.setDeadline("Nov 15, 2026");
            p2.setExperienceLevel("Intermediate");
            p2.setSkills(Arrays.asList("Figma", "UI/UX", "Mobile Design"));
            p2.setStatus("open");
            projectRepository.save(p2);

            // Seed Proposal for p1 from freelancer
            Proposal proposal = new Proposal();
            proposal.setProjectId(savedP1.getId());
            proposal.setProjectTitle(savedP1.getTitle());
            proposal.setFreelancerId(freelancer.getId());
            proposal.setFreelancerName(freelancer.getDisplayName());
            proposal.setBidAmount(4500.0);
            proposal.setEstimatedDays(30);
            proposal.setCoverLetter("Hello! I am a full-stack developer with extensive experience building modern e-commerce web applications with React, TypeScript, and robust payment integrations. I have delivered similar projects and would love to build this for you.");
            proposal.setStatus("pending");
            proposalRepository.save(proposal);

            logger.info("Seeded 2 demo projects and 1 proposal into MongoDB");
        }
    }
}
