package com.freelancehub.service;

import com.freelancehub.model.Notification;
import com.freelancehub.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Notification createNotification(String userId, String title, String message, String type, String link) {
        if (userId == null) return null;
        Notification notification = new Notification(userId, title, message, type, link);
        Notification saved = notificationRepository.save(notification);

        try {
            // Push real-time event to user's private notification topic
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, saved);
        } catch (Exception e) {
            logger.warn("Failed to dispatch WebSocket notification to user {}: {}", userId, e.getMessage());
        }

        return saved;
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public boolean markAsRead(String notificationId, String userId) {
        return notificationRepository.findById(notificationId).map(n -> {
            if (n.getUserId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
                return true;
            }
            return false;
        }).orElse(false);
    }

    public void markAllAsRead(String userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }
}
