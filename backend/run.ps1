param(
  [string]$DbUser = "root",
  [string]$DbPassword = "123456",
  [int]$Port = 8080,
  [switch]$InitDb,
  [string]$AiKey = "",
  [string]$AiModel = "deepseek-chat",
  [string]$AiBaseUrl = "https://api.deepseek.com/v1"
)

# 一键启动后端：.\run.ps1 -DbPassword "你的MySQL密码"
# 首次运行可加 -InitDb：自动建库 + 导入种子数据

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$jar = Join-Path $root "target\village-server-3.0.0.jar"

if ($InitDb) {
    Write-Host "[1/3] 建库并导入种子数据..." -ForegroundColor Cyan
    $env:MYSQL_PWD = $DbPassword
    $schema = Join-Path $root "..\db\schema.sql"
    $seed = Join-Path $root "..\db\seed.sql"
    try {
        cmd /c "mysql -u $DbUser < ""$schema"""
        if ($LASTEXITCODE -ne 0) { throw "建库脚本执行失败，请检查 MySQL 密码/服务" }
        cmd /c "mysql -u $DbUser xinyuan_village < ""$seed"""
        if ($LASTEXITCODE -ne 0) { throw "种子导入失败" }
    } finally {
        Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
    }
}

if (-not (Test-Path $jar)) {
    Write-Host "[2/3] 首次运行，打包中..." -ForegroundColor Cyan
    Push-Location $root
    try {
        if (Get-Command mvn -ErrorAction SilentlyContinue) {
            mvn -q -DskipTests package
        } else {
            # 没装 Maven 时用仓库自带的 wrapper
            & ".\mvnw.cmd" -q -DskipTests package
        }
    } finally { Pop-Location }
}

Write-Host "[3/3] 启动 http://127.0.0.1:$Port/api/v1/home" -ForegroundColor Green
Write-Host "      数据库账号：$DbUser（密码通过环境变量注入）" -ForegroundColor DarkGray

$env:DB_USER = $DbUser
$env:DB_PASSWORD = $DbPassword
if ($AiKey) {
    Write-Host "      已启用大模型：$AiModel" -ForegroundColor Cyan
    $env:AI_ENABLED = "true"
    $env:AI_API_KEY = $AiKey
    $env:AI_MODEL = $AiModel
    $env:AI_BASE_URL = $AiBaseUrl
}
Push-Location $root
try {
    java -jar $jar --server.port=$Port
} finally {
    Pop-Location
}
