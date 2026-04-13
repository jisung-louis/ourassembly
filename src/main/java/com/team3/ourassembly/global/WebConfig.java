package com.team3.ourassembly.global;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${qr.save.path}")
    private String qrSavePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/qr-images/**")
                .addResourceLocations(Path.of(qrSavePath).toAbsolutePath().toUri().toString());

        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }
}
