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
                                "/api/auth/login", "/api/auth/register/client", "/api/auth/register/coach", "/api/auth/refresh", "/api/auth/logout",
                                "/api/email/confirm", "/api/email/resend-confirmation",
                                "/api/user/forgot-password", "/api/user/reset-password")
                        .permitAll()

                        // Admin endpoints
                        .requestMatchers(
                                "/api/auth/register/admin",
                                "/api/application/updateStatus",
                                "/api/client/all", "/api/client/assign/{client_id}/{coach_id}")
                        .hasAuthority("ADMIN")

                        // Coach endpoints
                        .requestMatchers("/api/application/accept/{application_id}", "/api/application/reject/{application_id}",
                                "/api/coach/profile",
                                "/api/client/my", "/api/client/quantity")
                        .hasAuthority("COACH")

                        // Client endpoints
                        .requestMatchers("/api/application/create")
                        .hasAuthority("CLIENT")

                        // Admin and coach endpoints
                        .requestMatchers(
                                "/api/exercise/add",
                                "/api/result/add/{client_id}")
                        .hasAnyAuthority("ADMIN", "COACH")

                        // Admin and client endpoints
                        .requestMatchers("/api/coach/{id}", "/api/coach/all")
                        .hasAnyAuthority("ADMIN", "CLIENT")

                        // Client and coach endpoints
                        .requestMatchers("/api/application/mine")
                        .hasAnyAuthority("COACH", "CLIENT")

                        // All users endpoints
                        .requestMatchers(
                                "/api/user/details", "/api/user/change-password", "/api/user/verify", "/api/user/check", "/api/user/image/{user_id}", "/api/user/image/update",
                                "/api/client/unsubscribe/{client_id}",
                                "/api/exercise/{id}", "/api/exercise/all", "/api/exercise/image/{id}", "/api/exercise/searchByAlias",
                                "/api/email/send-verification-code", "/api/email/update-email",
                                "/api/result/{client_id}", "/api/result/current/{client_id}", "/api/result/update", "/api/result/delete")
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
