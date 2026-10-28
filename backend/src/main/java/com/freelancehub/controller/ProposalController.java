package com.freelancehub.controller;

import com.freelancehub.dto.MarketplaceDto.ProposalRequest;
import com.freelancehub.model.Project;
import com.freelancehub.model.Proposal;
import com.freelancehub.model.User;
import com.freelancehub.repository.ProjectRepository;
import com.freelancehub.repository.ProposalRepository;
import com.freelancehub.repository.UserRepository;
import com.freelancehub.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/proposals")
@Tag(name = "Proposals", description = "Proposal submission and acceptance")
public class ProposalController {

    private final ProposalRepository proposalRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProposalController(ProposalRepository proposalRepository,
                              ProjectRepository projectRepository,
                              UserRepository userRepository) {
        this.proposalRepository = proposalRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/project/{projectId}")
    @Operation(summary = "Submit a proposal for a project (Freelancer)")
    public ResponseEntity<?> submitProposal(
            @PathVariable String projectId,
            @RequestBody ProposalRequest req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) return ResponseEntity.status(401).build();

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        if (project.getClientId().equals(userDetails.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "You cannot submit a proposal to your own project"));
        }

        // Check if already submitted
        Optional<Proposal> existing = proposalRepository.findByProjectIdAndFreelancerId(projectId, userDetails.getId());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "You have already submitted a proposal for this project"));
        }

        User freelancer = userRepository.findById(userDetails.getId()).orElse(null);

        Proposal p = new Proposal();
        p.setProjectId(projectId);
        p.setProjectTitle(project.getTitle());
        p.setFreelancerId(userDetails.getId());
        p.setFreelancerName(freelancer != null ? freelancer.getDisplayName() : userDetails.getUsername());
        p.setCoverLetter(req.getCoverLetter());
        p.setBidAmount(req.getBidAmount());
        p.setCurrency(project.getCurrency());
        p.setEstimatedDays(req.getEstimatedDays());
        p.setStatus("pending");

        Proposal saved = proposalRepository.save(p);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get proposals for a project")
    public ResponseEntity<?> getProjectProposals(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        List<Proposal> proposals = proposalRepository.findByProjectIdOrderByCreatedAtDesc(projectId);

        // If client or admin, return all proposals
        if (userDetails != null && (project.getClientId().equals(userDetails.getId()) || "ADMIN".equalsIgnoreCase(userDetails.getRole()))) {
            return ResponseEntity.ok(proposals);
        }

        // If freelancer, return only their proposal
        if (userDetails != null) {
            return ResponseEntity.ok(proposals.stream()
                    .filter(p -> p.getFreelancerId().equals(userDetails.getId()))
                    .toList());
        }

        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/my")
    @Operation(summary = "Get all proposals submitted by current freelancer")
    public ResponseEntity<List<Proposal>> getMyProposals(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(proposalRepository.findByFreelancerIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @PostMapping("/{proposalId}/accept")
    @Operation(summary = "Accept a proposal (Client)")
    public ResponseEntity<?> acceptProposal(
            @PathVariable String proposalId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Proposal proposal = proposalRepository.findById(proposalId).orElse(null);
        if (proposal == null) return ResponseEntity.notFound().build();

        Project project = projectRepository.findById(proposal.getProjectId()).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        if (!project.getClientId().equals(userDetails.getId()) && !"ADMIN".equalsIgnoreCase(userDetails.getRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Not authorized"));
        }

        proposal.setStatus("accepted");
        proposalRepository.save(proposal);

        // Reject other pending proposals for this project
        List<Proposal> others = proposalRepository.findByProjectIdOrderByCreatedAtDesc(project.getId());
        for (Proposal other : others) {
            if (!other.getId().equals(proposal.getId()) && "pending".equalsIgnoreCase(other.getStatus())) {
                other.setStatus("rejected");
                proposalRepository.save(other);
            }
        }

        // Set project in_progress and assign hired freelancer
        project.setStatus("in_progress");
        project.setHiredFreelancerId(proposal.getFreelancerId());
        project.setHiredFreelancerName(proposal.getFreelancerName());
        projectRepository.save(project);

        return ResponseEntity.ok(proposal);
    }

    @PostMapping("/{proposalId}/reject")
    @Operation(summary = "Reject a proposal (Client)")
    public ResponseEntity<?> rejectProposal(
            @PathVariable String proposalId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Proposal proposal = proposalRepository.findById(proposalId).orElse(null);
        if (proposal == null) return ResponseEntity.notFound().build();

        Project project = projectRepository.findById(proposal.getProjectId()).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        if (!project.getClientId().equals(userDetails.getId()) && !"ADMIN".equalsIgnoreCase(userDetails.getRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Not authorized"));
        }

        proposal.setStatus("rejected");
        proposalRepository.save(proposal);

        return ResponseEntity.ok(proposal);
    }
}
