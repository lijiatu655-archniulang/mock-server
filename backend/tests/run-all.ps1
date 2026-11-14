# 一键回归：复位种子 + 五组测试
# 用法：powershell -ExecutionPolicy Bypass -File tests\run-all.ps1 -DbPassword "你的MySQL密码"
param(
  [string]$DbUser = "root",
  [string]$DbPassword = "123456"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Definition)
$db = Join-Path $root "..\db\seed.sql"

Write-Host "[0/5] 复位种子数据..." -ForegroundColor Cyan
$env:MYSQL_PWD = $DbPassword
try {
  cmd /c "mysql -u $DbUser xinyuan_village < ""$db"""
  if ($LASTEXITCODE -ne 0) { throw "种子导入失败，请检查 MySQL 密码/服务" }
} finally {
  Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
}

Push-Location $root
try {
  Write-Host "[1/5] 契约测试（50 条）..." -ForegroundColor Cyan
  node tests\api-test.mjs
  Write-Host "[2/5] 页面加载测试（16 页）..." -ForegroundColor Cyan
  node tests\frontend-sim.mjs
  Write-Host "[3/5] 交互测试（17 条）..." -ForegroundColor Cyan
  node tests\interaction-test.mjs
  Write-Host "[4/5] 预留接口（10 条）..." -ForegroundColor Cyan
  node tests\reserved-test.mjs
  Write-Host "[5/5] 账号密码登录..." -ForegroundColor Cyan
  node tests\password-check.mjs
} finally {
  Pop-Location
}
