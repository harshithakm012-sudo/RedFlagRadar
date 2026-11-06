package com.redflagradar.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class DetectionClientConfiguration {
    @Bean
    RestClient detectionRestClient(
            RestClient.Builder builder,
            @Value("${detection.service.base-url}") String baseUrl,
            @Value("${detection.service.connect-timeout:2s}") Duration connectTimeout,
            @Value("${detection.service.read-timeout:15s}") Duration readTimeout) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeout);
        requestFactory.setReadTimeout(readTimeout);
        return builder.baseUrl(baseUrl).requestFactory(requestFactory).build();
    }
}
