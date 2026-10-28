package com.freelancehub.service;

import com.freelancehub.dto.MarketplaceDto.RazorpayOrderResponse;
import com.freelancehub.model.Payment;
import com.freelancehub.model.Project;
import com.freelancehub.model.User;
import com.freelancehub.repository.PaymentRepository;
import com.freelancehub.repository.ProjectRepository;
import com.freelancehub.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
public class RazorpayService {
    private static final Logger logger = LoggerFactory.getLogger(RazorpayService.class);

    @Value("${app.razorpay.key-id}")
    private String keyId;

    @Value("${app.razorpay.key-secret}")
    private String keySecret;

    @Value("${app.razorpay.webhook-secret}")
    private String webhookSecret;

    private final ProjectRepository projectRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public RazorpayService(ProjectRepository projectRepository,
                           PaymentRepository paymentRepository,
                           UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a real Razorpay order via the Razorpay Java SDK.
     * Amount is stored as a major currency unit and sent to Razorpay in the smallest unit.
     */
    public RazorpayOrderResponse createOrder(String projectId, Double ignoredClientAmount) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        Double amount = project.getBudget();
        if (amount == null || amount <= 0) throw new IllegalArgumentException("Project amount must be positive");
        String currency = normalizeCurrency(project.getCurrency());
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            // Razorpay requires the amount in the currency's smallest unit.
            options.put("amount", (long) (amount * 100));
            options.put("currency", currency);
            options.put("receipt", "receipt_" + projectId);
            options.put("notes", new JSONObject().put("projectId", projectId));

            Order order = client.orders.create(options);
            String orderId = order.get("id");
            logger.info("Razorpay order created: {} for project: {}", orderId, projectId);
            return new RazorpayOrderResponse(orderId, amount, currency, keyId);

        } catch (RazorpayException e) {
            logger.error("Failed to create Razorpay order: {}", e.getMessage());
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies Razorpay payment signature using HMAC-SHA256.
     */
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return signature != null && java.security.MessageDigest.isEqual(
                    hexString.toString().getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            logger.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Verifies payment signature and persists the payment record; marks project completed.
     */
    public Payment verifyAndCompletePayment(String projectId, String clientId,
                                            String razorpayOrderId, String razorpayPaymentId,
                                            String razorpaySignature, Double amount) {

        if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
            logger.warn("Razorpay signature mismatch for order: {}", razorpayOrderId);
            throw new RuntimeException("Payment verification failed: invalid signature");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        User client = userRepository.findById(clientId).orElse(null);
        User freelancer = project.getHiredFreelancerId() != null
                ? userRepository.findById(project.getHiredFreelancerId()).orElse(null)
                : null;

        Payment payment = new Payment();
        payment.setProjectId(project.getId());
        payment.setProjectTitle(project.getTitle());
        payment.setClientId(clientId);
        payment.setClientName(client != null ? client.getDisplayName() : "Client");
        payment.setFreelancerId(project.getHiredFreelancerId());
        payment.setFreelancerName(freelancer != null ? freelancer.getDisplayName() : "Freelancer");
        payment.setAmount(project.getBudget());
        payment.setCurrency(normalizeCurrency(project.getCurrency()));
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setStatus("completed");
        Payment saved = paymentRepository.save(payment);

        // Mark project completed
        project.setStatus("completed");
        projectRepository.save(project);

        logger.info("Payment completed: {} for project: {}", razorpayPaymentId, projectId);
        return saved;
    }

    private String normalizeCurrency(String currency) {
        String normalized = currency == null ? "USD" : currency.trim().toUpperCase();
        if (!"USD".equals(normalized) && !"INR".equals(normalized)) {
            throw new IllegalArgumentException("Project currency must be USD or INR");
        }
        return normalized;
    }

    /**
     * Verifies a Razorpay webhook signature.
     */
    public boolean verifyWebhookSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return signature != null && java.security.MessageDigest.isEqual(
                    hexString.toString().getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            logger.error("Webhook signature verification error: {}", e.getMessage());
            return false;
        }
    }
}
