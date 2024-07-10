package com.liftlogix.config;

import com.liftlogix.services.UserDetailsService;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class SecurityConfig {
    private final UserDetailsService userDetailsService;
    private final JWTAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(request -> request

                        // Public endpoints
                        .requestMatchers(
                                "/api/",
                                "/api/auth/login", "/api/auth/register/client", "/api/auth/register/coach", "/api/auth/refresh", "/api/auth/confirm", "/api/auth/resend-confirmation")
                        .permitAll()

                        // Admin endpoints
                        .requestMatchers(
                                "/api/auth/register/admin",
                                "/api/application/updateStatus",
                                "/api/client/all", "/api/client/assign/{client_id}/{coach_id}")
                        .hasAuthority("ADMIN")

                        // Coach endpoints
                        .requestMatchers("/api/application/accept/{application_id}", "/api/application/reject/{application_id}",
                                "/api/coach/profile")
                        .hasAuthority("COACH")

                        // Client endpoints
                        .requestMatchers("/api/application/create")
                        .hasAuthority("CLIENT")

                        // Admin and coach endpoints
                        .requestMatchers(
                                "/api/exercise/add",
                                "/api/client/all")
                        .hasAnyAuthority("ADMIN", "COACH")

                        // Admin and client endpoints
                        .requestMatchers("/api/coach/{id}", "/api/coach/all")
                        .hasAnyAuthority("ADMIN", "CLIENT")

                        // Client and coach endpoints
                        .requestMatchers("/api/application/mine")
                        .hasAnyAuthority("COACH", "CLIENT")

                        // All users endpoints
                        .requestMatchers(
                                "/api/user/details",
                                "/api/client/unsubscribe/{client_id}",
                                "/api/exercise/{id}", "/api/exercise/all", "/api/exercise/image/{id}",
                                "/api/auth/send-verification-code", "/api/auth/update-email",
                                "/api/verification/verify")
                        .authenticated()

                        // Other endpoints
                        .anyRequest().authenticated())

                .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider()).addFilterBefore(
                        jwtAuthFilter, UsernamePasswordAuthenticationFilter.class
                );
        return httpSecurity.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
