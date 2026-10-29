$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
try {
  $finstartNodeCommand = Get-Command node -ErrorAction SilentlyContinue
  $finstartNode = if ($finstartNodeCommand) { $finstartNodeCommand.Source } else { Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
  if (-not (Test-Path -LiteralPath $finstartNode)) { throw 'Instale Node.js 24 ou superior para executar a FinStart.' }
  $finstartVersion = & $finstartNode -p "Number(process.versions.node.split('.')[0])"
  if ([int]$finstartVersion -lt 24) { throw 'A FinStart precisa do Node.js 24 ou superior.' }
  if (-not (Test-Path -LiteralPath 'node_modules/express/package.json')) {
    Write-Host 'Preparando as dependencias da FinStart. Aguarde...'
    $finstartNpm = Get-Command npm.cmd -ErrorAction SilentlyContinue
    $finstartPnpm = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'
    $finstartOldPath = $env:PATH
    try {
      $env:PATH = (Split-Path -Parent $finstartNode) + ';' + $env:PATH
      if ($finstartNpm) { & $finstartNpm.Source install --omit=dev --ignore-scripts }
      elseif (Test-Path -LiteralPath $finstartPnpm) { & $finstartPnpm install --prod --frozen-lockfile --ignore-scripts }
      else { throw 'Instale o Node.js com npm para preparar as dependencias.' }
      if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel instalar as dependencias. Verifique sua conexao.' }
    } finally { $env:PATH = $finstartOldPath }
  }
  if (-not (Test-Path -LiteralPath '.env')) {
    $finstartSecret = & $finstartNode -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
    [IO.File]::WriteAllText((Join-Path $PSScriptRoot '.env'), "JWT_SECRET=$finstartSecret`nPORT=3000`nDB_PATH=data/finstart.sqlite", (New-Object Text.UTF8Encoding $false))
  }
  $finstartEnvPath = Join-Path $PSScriptRoot '.env'
  $finstartEnvText = [IO.File]::ReadAllText($finstartEnvPath).TrimStart([char]0xFEFF)
  [IO.File]::WriteAllText($finstartEnvPath, $finstartEnvText, (New-Object Text.UTF8Encoding $false))
  & $finstartNode --env-file=.env scripts/mysql-local.js
  if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel conectar o MySQL exclusivo. Confira a mensagem acima.' }
  $finstartPort = 3000
  foreach ($finstartLine in Get-Content -LiteralPath '.env') { if ($finstartLine -match '^\s*PORT\s*=\s*"?(\d+)"?\s*$') { $finstartPort = [int]$Matches[1] } }
  $finstartUrl = "http://127.0.0.1:$finstartPort"
  function Test-FinStart {
    try { $finstartHealth = Invoke-RestMethod -Uri "$finstartUrl/api/saude" -TimeoutSec 2; return ($finstartHealth.status -eq 'ok' -and $finstartHealth.banco -eq 'conectado') } catch { return $false }
  }
  if (-not (Test-FinStart)) {
    $finstartProcess = Start-Process -FilePath $finstartNode -ArgumentList '--env-file=.env','server/index.js' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $PSScriptRoot 'server-output.log') -RedirectStandardError (Join-Path $PSScriptRoot 'server-error.log') -PassThru
    for ($finstartTry = 0; $finstartTry -lt 12; $finstartTry++) { if (Test-FinStart) { break }; Start-Sleep -Milliseconds 500 }
    if (-not (Test-FinStart)) { throw 'Nao foi possivel iniciar. Confira server-error.log ou se a porta esta ocupada.' }
  }
  Write-Host "FinStart ativa e banco conectado: $finstartUrl" -ForegroundColor Green
  Start-Process $finstartUrl
} catch {
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
}
