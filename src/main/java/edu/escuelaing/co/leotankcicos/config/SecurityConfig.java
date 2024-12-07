package edu.escuelaing.co.leotankcicos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig{

    // @Override
    // public void addCorsMappings(CorsRegistry registry) {
    //     // Permitir solicitudes CORS desde tu frontend
    //     registry.addMapping("/**")
    //             .allowedOrigins("https://frontarsw.z22.web.core.windows.net")
    //             .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    //             .allowedHeaders("*")
    //             .allowCredentials(true);
    // }

    // @Bean
    // public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    //     http
    //         .csrf().disable()
    //         .authorizeHttpRequests(authorize -> authorize
    //             .requestMatchers("/api/tanks/login", "/api/tanks/username").permitAll()
    //             .requestMatchers("/api/tanks/**").authenticated()
    //             .anyRequest().authenticated()
    //         )
    //         .oauth2ResourceServer(oauth2 -> oauth2
    //             .jwt() // Habilita la validación de tokens JWT
    //         )
    //         .cors();
    //     return http.build();
    // }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable() // Desactiva CSRF para simplificar
            .cors() // Habilita CORS
            .and()
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/tanks/login", "/api/tanks/username").permitAll()
                .requestMatchers("/api/tanks/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt()
            );
        return http.build();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Aplica a todas las rutas
                        .allowedOrigins("https://frontarsw.z22.web.core.windows.net") // Dominio permitido
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Métodos HTTP permitidos
                        .allowedHeaders("*") // Permitir todos los encabezados
                        .exposedHeaders("Authorization") // Exponer encabezados como Authorization
                        .allowCredentials(true); // Permitir credenciales (cookies, tokens)
            }
        };
    }
}