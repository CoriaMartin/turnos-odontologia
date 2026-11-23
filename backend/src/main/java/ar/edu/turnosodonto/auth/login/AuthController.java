package ar.edu.turnosodonto.auth.login;

import java.time.Instant;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ar.edu.turnosodonto.auth.token.TokenEmitido;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record LoginRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 200) String password) {

        /** Evita que la contraseña aparezca si el objeto se loguea. */
        @Override
        public String toString() {
            return "LoginRequest[email=" + email + ", password=****]";
        }
    }

    public record LoginResponse(String token, String tipo, Instant expiraEn) {
    }

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest solicitud) {
        TokenEmitido emitido = authService.login(solicitud.email(), solicitud.password());
        return new LoginResponse(emitido.token(), "Bearer", emitido.expiraEn());
    }
}
