package edu.escuelaing.co.leotankcicos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
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
                .clientId("47c6a63b-2699-4c84-bd3e-e761c37671fd")
                .clientSecret("f8P8Q~R.Odx2_LKlmVMeI6BXfoexbomvPOr.ncF.")
                .scope("openid", "profile", "email")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE) // Especifica el grant type
                .authorizationUri("https://login.microsoftonline.com/db7dde3f-69fc-4e7b-9d6e-0e5a535c77c5/oauth2/authorize")
                .tokenUri("https://login.microsoftonline.com/db7dde3f-69fc-4e7b-9d6e-0e5a535c77c5/oauth2/token")
                .userInfoUri("https://graph.microsoft.com/v1.0/me")
                .clientName("Azure OAuth2")
                .build();
    }

    
}

