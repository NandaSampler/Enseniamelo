package com.enseniamelo.configserver;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

	@Bean
	public SecurityFilterChain configure(HttpSecurity http) throws Exception {
	http
	    .csrf(csrf -> csrf.disable())
	    .httpBasic(httpBasic -> {})
	    .authorizeHttpRequests(auth -> auth
	    .anyRequest().authenticated()
	    );
	return http.build();
	}
}