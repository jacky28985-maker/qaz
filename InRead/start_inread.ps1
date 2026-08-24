$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 4173
$url = "http://127.0.0.1:$port/search.html"

$pythonCandidates = @(
  "py",
  "python",
  "C:\Users\Yangf\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
)

$command = $null
foreach ($candidate in $pythonCandidates) {
  if ($candidate -like "*python.exe" -and (Test-Path -LiteralPath $candidate)) {
    $command = $candidate
    break
  }
  if (Get-Command $candidate -ErrorAction SilentlyContinue) {
    $command = $candidate
    break
  }
}

if (-not $command) {
  Write-Host "没有找到可用的 Python 运行环境，无法启动本地预览。"
  Write-Host "你仍然可以直接在浏览器中打开 search.html。"
  exit 1
}

$existing = Get-CimInstance Win32_Process | Where-Object {
  $_.CommandLine -match "http\.server $port" -and $_.CommandLine -match [regex]::Escape($root)
}

if (-not $existing) {
  if ($command -eq "py") {
    Start-Process -FilePath "py" -ArgumentList "-3","-m","http.server",$port -WorkingDirectory $root -WindowStyle Hidden
  } elseif ($command -eq "python") {
    Start-Process -FilePath "python" -ArgumentList "-m","http.server",$port -WorkingDirectory $root -WindowStyle Hidden
  } else {
    Start-Process -FilePath $command -ArgumentList "-m","http.server",$port -WorkingDirectory $root -WindowStyle Hidden
  }
  Start-Sleep -Seconds 2
}

Start-Process $url
Write-Host "InRead 已在浏览器中打开：$url"
