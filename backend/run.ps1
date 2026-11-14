param(
  [string]$DbUser = "root",
  [string]$DbPassword = "123456",
  [int]$Port = 8080,
  [switch]$InitDb
)

# 一键启动后端：.\run.ps1 -DbPassword "你的MySQL密码"
# 首次运行可加 -InitDb：自动建库 + 导入种子数据

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$jar = Join-Path $root "target\village-server-2.0.0.jar"

if ($InitDb) {
    Write-Host "[1/3] 建库并导入种子数据..." -ForegroundColor Cyan
    $env:MYSQL_PWD = $DbPassword
    try {
        Get-Content -Raw -Encoding UTF8 (Join-Path $root "..\db\schema.sql") | mysql -u $DbUser
        Get-Content -Raw -Encoding UTF8 (Join-Path $root "..\db\seed.sql") | mysql -u $DbUser xinyuan_village
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
Push-Location $root
try {
    java -jar $jar --server.port=$Port
} finally {
    Pop-Location
}
