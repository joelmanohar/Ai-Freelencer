package com.freelancehub.controller;

import com.freelancehub.dto.MarketplaceDto.RazorpayOrderResponse;
import com.freelancehub.model.Payment;
import com.freelancehub.repository.PaymentRepository;
import com.freelancehub.security.UserDetailsImpl;
import com.freelancehub.service.RazorpayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Razorpay payment processing and history")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final RazorpayService razorpayService;
    private final PaymentRepository paymentRepository;

    public PaymentController(RazorpayService razorpayService, PaymentRepository paymentRepository) {
        this.razorpayService = razorpayService;
        this.paymentRepository = paymentRepository;
    }

    @PostMapping("/create-order")
    @Operation(summary = "Create Razorpay payment order for project release")
    public ResponseEntity<RazorpayOrderResponse> createOrder(@RequestBody Map<String, Object> req) {
        String projectId = (String) req.get("projectId");
        Double amount = Double.valueOf(req.get("amount").toString());
        return ResponseEntity.ok(razorpayService.createOrder(projectId, amount));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment signature and complete milestone")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        String projectId         = (String) req.get("projectId");
        String razorpayOrderId   = (String) req.get("razorpayOrderId");
        String razorpayPaymentId = (String) req.get("razorpayPaymentId");
        String razorpaySignature = (String) req.get("razorpaySignature");
        Double amount = req.get("amount") != null ? Double.valueOf(req.get("amount").toString()) : null;

        try {
            Payment payment = razorpayService.verifyAndCompletePayment(
                    projectId, userDetails.getId(),
                    razorpayOrderId, razorpayPaymentId, razorpaySignature, amount);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            logger.error("Payment verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Razorpay Webhook endpoint — receives payment events from Razorpay servers.
     * Configure this URL in your Razorpay dashboard: POST /api/payments/webhook
     */
    @PostMapping("/webhook")
    @Operation(summary = "Razorpay webhook endpoint (server-to-server events)")
    public ResponseEntity<?> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        logger.info("Received Razorpay webhook event");

        if (!razorpayService.verifyWebhookSignature(payload, signature)) {
            logger.warn("Invalid Razorpay webhook signature");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid webhook signature"));
        }

        // Optionally parse and handle specific events (payment.captured, order.paid, etc.)
        logger.info("Webhook payload: {}", payload);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user payment history")
    public ResponseEntity<List<Payment>> getMyPayments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if ("FREELANCER".equalsIgnoreCase(userDetails.getRole())) {
            return ResponseEntity.ok(paymentRepository.findByFreelancerIdOrderByCreatedAtDesc(userDetails.getId()));
        }
        return ResponseEntity.ok(paymentRepository.findByClientIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all payments (Admin only)")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentRepository.findAllByOrderByCreatedAtDesc());
    }
}
