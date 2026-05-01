package com.fittrack.shared.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

/**
 * SINGLETON PATTERN
 * Ensures only ONE instance exists throughout the application
 */
@Component
public class AppConfigManager {
    
    private static AppConfigManager instance;
    private final Map<String, String> configs;
    
    // Private constructor - prevents external instantiation
    private AppConfigManager() {
        configs = new HashMap<>();
        System.out.println("🔵 [SINGLETON] Instance created!");
    }
    
    // Global access point
    public static AppConfigManager getInstance() {
        if (instance == null) {
            instance = new AppConfigManager();
        }
        return instance;
    }
    
    @PostConstruct
    public void init() {
        instance = this;
        loadConfigs();
    }
    
    private void loadConfigs() {
        configs.put("app.name", "FitTrack");
        configs.put("app.version", "1.0.0");
        configs.put("jwt.expiry", "86400000");
        configs.put("workout.reminder.enabled", "true");
        System.out.println("✅ [SINGLETON] Loaded " + configs.size() + " configs");
    }
    
    public String get(String key) {
        return configs.get(key);
    }
    
    public void set(String key, String value) {
        configs.put(key, value);
    }
    
    public boolean contains(String key) {
        return configs.containsKey(key);
    }
}