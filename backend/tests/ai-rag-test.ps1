# AI + RAG 集成测试：用 echo 假模型起一个临时实例，验证检索/提示词/流式/落库，不需要 API key
param([int]$Port = 8081)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Definition)
$jar = Get-ChildItem (Join-Path $root "target\village-server-*.jar") | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $jar) { throw "找不到 jar，请先 mvn -DskipTests package" }

Write-Host "[AI] 启动 echo 实例 :$Port ..." -ForegroundColor Cyan
$argLine = '-jar "' + $jar.FullName + '" --server.port=' + $Port + ' --app.ai.enabled=true --app.ai.provider=echo --app.ai.api-key=test'
$proc = Start-Process java -ArgumentList $argLine -PassThru -WindowStyle Hidden
try {
  $ok = $false
  for ($i = 0; $i -lt 40; $i++) {
    try { Invoke-RestMethod "http://127.0.0.1:$Port/api/v1/home" -TimeoutSec 2 | Out-Null; $ok = $true; break }
    catch { Start-Sleep -Milliseconds 800 }
  }
  if (-not $ok) { throw "临时实例启动超时" }
  $env:BASE = "http://127.0.0.1:$Port/api/v1"
  node tests\ai-rag-check.mjs
  Write-Host "[AI] 完成" -ForegroundColor Green
} finally {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Remove-Item Env:BASE -ErrorAction SilentlyContinue
}
