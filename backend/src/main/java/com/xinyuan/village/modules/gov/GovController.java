package com.xinyuan.village.modules.gov;

import com.xinyuan.village.common.api.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/gov")
@RequiredArgsConstructor
public class GovController {

    private final GovService govService;

    @GetMapping("/categories")
    public Result<Map<String, Object>> categories() {
        return Result.ok(govService.categories());
    }

    @GetMapping("/items")
    public Result<Map<String, Object>> items(@RequestParam(required = false) String categoryId,
                                             @RequestParam(required = false) String keyword) {
        return Result.ok(govService.items(categoryId, keyword));
    }

    @GetMapping("/items/{code}")
    public Result<Map<String, Object>> detail(@PathVariable String code) {
        return Result.ok(govService.detail(code));
    }
}
