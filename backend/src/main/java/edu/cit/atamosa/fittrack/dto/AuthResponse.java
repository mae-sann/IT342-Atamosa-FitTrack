package edu.cit.atamosa.fittrack.dto;

public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserData user;
    
    // Inner class for user data
    public static class UserData {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String role;
        
        // Constructor, getters, setters
        public UserData(Long id, String firstName, String lastName, String email, String role) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.role = role;
        }
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
    
    // Constructor
    public AuthResponse(String accessToken, String refreshToken, UserData user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }
    
    // Getters and setters
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    
    public UserData getUser() { return user; }
    public void setUser(UserData user) { this.user = user; }
}