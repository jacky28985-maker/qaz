$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcher = Join-Path $root 'connect_inread.bat'

if (-not (Test-Path -LiteralPath $launcher)) {
  Write-Host '找不到 connect_inread.bat，无法连接 InRead 服务。'
  exit 1
}

# Delegate to the same SSH tunnel launcher as the BAT entry point.
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', ('"{0}"' -f $launcher) -WorkingDirectory $root
