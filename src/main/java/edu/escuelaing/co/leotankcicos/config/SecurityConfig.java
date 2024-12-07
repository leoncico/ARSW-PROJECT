package edu.escuelaing.co.leotankcicos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
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

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(clientRegistration());
    }

    @Bean
    public ClientRegistration clientRegistration() {
        return ClientRegistration.withRegistrationId("azure")
                .clientId("your-client-id")
                .clientSecret("your-client-secret")
                .scope("openid", "profile", "email")
                .authorizationUri("https://login.microsoftonline.com/{tenant}/oauth2/authorize")
                .tokenUri("https://login.microsoftonline.com/{tenant}/oauth2/token")
                .userInfoUri("https://graph.microsoft.com/v1.0/me")
                .clientName("Azure OAuth2")
                .build();
    }

    
}

