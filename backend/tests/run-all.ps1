# 一键回归：复位种子 + 四组测试
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Definition)
$db = Join-Path $root "..\db\seed.sql"

Write-Host "[0/4] 复位种子数据..." -ForegroundColor Cyan
Get-Content -Raw -Encoding UTF8 $db | mysql -uroot -p123456 xinyuan_village 2>$null

Push-Location $root
Write-Host "[1/4] 契约测试（50 条）..." -ForegroundColor Cyan
node tests\api-test.mjs
Write-Host "[2/4] 页面加载测试（16 页）..." -ForegroundColor Cyan
node tests\frontend-sim.mjs
Write-Host "[3/4] 交互测试（17 条）..." -ForegroundColor Cyan
node tests\interaction-test.mjs
Write-Host "[4/4] 预留接口（10 条）..." -ForegroundColor Cyan
node tests\reserved-test.mjs
Pop-Location
