package com.freelancehub.service;

import com.freelancehub.model.Payment;
import com.freelancehub.model.Project;
import com.freelancehub.model.Proposal;
import com.freelancehub.model.User;
import com.freelancehub.repository.PaymentRepository;
import com.freelancehub.repository.ProjectRepository;
import com.freelancehub.repository.ProposalRepository;
import com.freelancehub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Converts legacy USD-denominated records to INR once, marking each converted record with INR. */
@Component
public class InrCurrencyMigration implements ApplicationRunner {
    private static final Logger logger = LoggerFactory.getLogger(InrCurrencyMigration.class);

    // Default USD/INR reference rate for 2026-10-28; override with APP_CURRENCY_USD_TO_INR if needed.
    @Value("${app.currency.usd-to-inr:95.298}")
    private double usdToInrRate;

    private final ProjectRepository projectRepository;
    private final ProposalRepository proposalRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public InrCurrencyMigration(ProjectRepository projectRepository,
                                ProposalRepository proposalRepository,
                                PaymentRepository paymentRepository,
                                UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.proposalRepository = proposalRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        int projects = 0;
        for (Project project : projectRepository.findAll()) {
            if (!"INR".equalsIgnoreCase(project.getCurrency())) {
                if (!"USD".equalsIgnoreCase(project.getCurrency())) {
                    throw new IllegalStateException("Unsupported project currency in project " + project.getId());
                }
                project.setBudget(convert(project.getBudget()));
                project.setCurrency("INR");
                projectRepository.save(project);
                projects++;
            }
        }

        int proposals = 0;
        for (Proposal proposal : proposalRepository.findAll()) {
            if (!"INR".equalsIgnoreCase(proposal.getCurrency())) {
                if (!"USD".equalsIgnoreCase(proposal.getCurrency())) {
                    throw new IllegalStateException("Unsupported proposal currency in proposal " + proposal.getId());
                }
                proposal.setBidAmount(convert(proposal.getBidAmount()));
                proposal.setCurrency("INR");
                proposalRepository.save(proposal);
                proposals++;
            }
        }

        int payments = 0;
        for (Payment payment : paymentRepository.findAll()) {
            if ("USD".equalsIgnoreCase(payment.getCurrency())) {
                payment.setAmount(convert(payment.getAmount()));
                payment.setCurrency("INR");
                paymentRepository.save(payment);
                payments++;
            } else if (!"INR".equalsIgnoreCase(payment.getCurrency())) {
                throw new IllegalStateException("Unsupported payment currency in payment " + payment.getId());
            }
        }

        int userRates = 0;
        for (User user : userRepository.findAll()) {
            if (!"INR".equalsIgnoreCase(user.getHourlyRateCurrency())) {
                if (!"USD".equalsIgnoreCase(user.getHourlyRateCurrency())) {
                    throw new IllegalStateException("Unsupported hourly-rate currency for user " + user.getId());
                }
                user.setHourlyRate(convert(user.getHourlyRate()));
                user.setHourlyRateCurrency("INR");
                userRepository.save(user);
                userRates++;
            }
        }

        if (projects + proposals + payments + userRates > 0) {
            logger.info("Converted legacy amounts to INR at {} INR/USD: {} projects, {} proposals, {} payments, {} hourly rates",
                    usdToInrRate, projects, proposals, payments, userRates);
        }
    }

    private Double convert(Double amount) {
        if (amount == null) return null;
        return BigDecimal.valueOf(amount)
                .multiply(BigDecimal.valueOf(usdToInrRate))
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
