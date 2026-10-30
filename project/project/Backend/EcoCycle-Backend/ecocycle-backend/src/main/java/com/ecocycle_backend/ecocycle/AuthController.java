
package com.ecocycle_backend.ecocycle;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AppUserRepository repository,
            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        if (request.getFullName() == null
                || request.getFullName().isBlank()
                || request.getEmail() == null
                || request.getEmail().isBlank()
                || request.getPassword() == null
                || request.getPassword().length() < 8) {

            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Name and email are required. Password must be at least 8 characters.")
            );
        }

        String name = request.getFullName().trim();
        String email = request.getEmail().trim()
                .toLowerCase();

        if (repository.existsByEmail(email)) {
            return ResponseEntity.status(
                    HttpStatus.CONFLICT)
                .body(Map.of("message",
                    "An account with this email already exists."));
        }

        AppUser user = new AppUser();
        user.setFullName(name);
        user.setEmail(email);
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));

        AppUser savedUser = repository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of(
                "message", "Account created successfully!",
                "user", Map.of(
                    "id", savedUser.getId(),
                    "name", savedUser.getFullName(),
                    "email", savedUser.getEmail()
                )
            ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        if (request.getEmail() == null
                || request.getEmail().isBlank()
                || request.getPassword() == null
                || request.getPassword().isBlank()) {

            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Email and password are required.")
            );
        }

        String email = request.getEmail().trim()
                .toLowerCase();

        Optional<AppUser> result =
                repository.findByEmail(email);

        if (result.isEmpty()
                || !passwordEncoder.matches(
                    request.getPassword(),
                    result.get().getPasswordHash())) {

            return ResponseEntity.status(
                    HttpStatus.UNAUTHORIZED)
                .body(Map.of("message",
                    "Invalid email or password."));
        }

        AppUser user = result.get();

        return ResponseEntity.ok(Map.of(
            "message", "Login successful!",
            "user", Map.of(
                "id", user.getId(),
                "name", user.getFullName(),
                "email", user.getEmail()
            )
        ));
    }

    public static class RegisterRequest {
        private String fullName;
        private String email;
        private String password;

        public RegisterRequest() {
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public LoginRequest() {
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
