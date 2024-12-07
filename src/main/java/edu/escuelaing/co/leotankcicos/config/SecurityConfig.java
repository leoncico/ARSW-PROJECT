package edu.escuelaing.co.leotankcicos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors() // Habilitar soporte para CORS
            .and()
            .csrf().disable() // Deshabilitar CSRF (opcional, según necesidad)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/tanks/login", "/api/tanks/username").permitAll() // Permitir estas rutas sin autenticación
                .requestMatchers("/api/tanks/**").authenticated() // Rutas que requieren autenticación
                .anyRequest().authenticated() // Cualquier otra solicitud requiere autenticación
            )
            .oauth2Login(); // Configuración de OAuth2
        return http.build();
    }
}
