param(
  [int]$LocalPort = 13000
)

$existing = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "InRead is already available at http://127.0.0.1:$LocalPort/"
  exit 0
}

$forward = "127.0.0.1:$LocalPort`:127.0.0.1:3000"
ssh -f -N -L $forward `
  -o ExitOnForwardFailure=yes `
  -o ServerAliveInterval=30 `
  -o ServerAliveCountMax=3 `
  snxy-dev

Write-Host "InRead is available at http://127.0.0.1:$LocalPort/"
