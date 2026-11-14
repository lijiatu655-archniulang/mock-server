package com.xinyuan.village.modules.home;

import com.xinyuan.village.common.api.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/home")
    public Result<Map<String, Object>> home(@RequestParam(required = false) String regionId) {
        return Result.ok(homeService.home(regionId));
    }
}
