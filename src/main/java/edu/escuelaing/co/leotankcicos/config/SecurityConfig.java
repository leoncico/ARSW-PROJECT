package edu.escuelaing.co.leotankcicos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/tanks/login", "/api/tanks/username").permitAll()
                .requestMatchers("/api/tanks/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login()
            .and();
        return http.build();
    }
}
