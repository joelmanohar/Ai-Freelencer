package com.freelancehub.dto;

public class AuthDto {

    public static class LoginRequest {
        private String email;
        private String password;

        public LoginRequest() {}
        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String email;
        private String password;
        private String displayName;
        private String role; // CLIENT or FREELANCER

        public RegisterRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class AuthResponse {
        private String token;
        private String id;
        private String email;
        private String displayName;
        private String role;

        public AuthResponse(String token, String id, String email, String displayName, String role) {
            this.token = token;
            this.id = id;
            this.email = email;
            this.displayName = displayName;
            this.role = role;
        }

        public String getToken() { return token; }
        public String getId() { return id; }
        public String getEmail() { return email; }
        public String getDisplayName() { return displayName; }
        public String getRole() { return role; }
    }
}
