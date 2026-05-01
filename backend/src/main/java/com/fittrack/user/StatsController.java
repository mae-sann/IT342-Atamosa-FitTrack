package com.fittrack.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fittrack.admin.AdminStatsService;

@RestController
@RequestMapping("/api/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
public class StatsController {

    private final AdminStatsService adminStatsService;

    public StatsController(AdminStatsService adminStatsService) {
        this.adminStatsService = adminStatsService;
    }

    @GetMapping
    public ResponseEntity<AdminStatsService.AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(adminStatsService.getStats());
    }
}
