package com.freelancehub.controller;

import com.freelancehub.dto.MarketplaceDto.ChatMessageRequest;
import com.freelancehub.model.Message;
import com.freelancehub.model.Project;
import com.freelancehub.model.User;
import com.freelancehub.repository.MessageRepository;
import com.freelancehub.repository.ProjectRepository;
import com.freelancehub.repository.UserRepository;
import com.freelancehub.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages/project/{projectId}")
@Tag(name = "Chat & Messaging", description = "Real-time project workspace chat via STOMP WebSocket and REST")
public class ChatController {

    private final MessageRepository messageRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(MessageRepository messageRepository,
                          ProjectRepository projectRepository,
                          UserRepository userRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // WebSocket STOMP Endpoint: client sends to /app/chat/{projectId}
    @MessageMapping("/chat/{projectId}")
    public void handleWebSocketMessage(@DestinationVariable String projectId, @Payload Message incoming) {
        Message saved = messageRepository.save(incoming);
        // Broadcast to topic subscribers
        messagingTemplate.convertAndSend("/topic/project/" + projectId, saved);
    }

    // REST Endpoint: Get messages for a project
    @GetMapping
    @Operation(summary = "Get all chat messages for a project")
    public ResponseEntity<?> getProjectMessages(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        // Check if user is participant (client, hired freelancer, or admin)
        boolean isClient = project.getClientId().equals(userDetails.getId());
        boolean isHired = project.getHiredFreelancerId() != null && project.getHiredFreelancerId().equals(userDetails.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(userDetails.getRole());

        if (!isClient && !isHired && !isAdmin) {
            return ResponseEntity.status(403).body(Map.of("message", "Not a project participant"));
        }

        List<Message> messages = messageRepository.findByProjectIdOrderByTimestampAsc(projectId);
        return ResponseEntity.ok(messages);
    }

    // REST Endpoint: Post message
    @PostMapping
    @Operation(summary = "Send a chat message to a project workspace")
    public ResponseEntity<?> sendProjectMessage(
            @PathVariable String projectId,
            @RequestBody ChatMessageRequest req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        User sender = userRepository.findById(userDetails.getId()).orElse(null);

        Message message = new Message(
                projectId,
                userDetails.getId(),
                sender != null ? sender.getDisplayName() : userDetails.getUsername(),
                sender != null ? sender.getRole() : userDetails.getRole(),
                req.getContent()
        );

        Message saved = messageRepository.save(message);

        // Notify WebSocket subscribers
        try {
            messagingTemplate.convertAndSend("/topic/project/" + projectId, saved);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(saved);
    }
}
