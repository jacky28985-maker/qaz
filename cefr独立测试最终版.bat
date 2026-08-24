@echo off
setlocal EnableExtensions

set "LOCAL_PORT=17860"
set "REMOTE_PORT=17860"
set "SSH_HOST=snxy-dev"
set "LOCAL_URL=http://127.0.0.1:%LOCAL_PORT%/"
set "HEALTH_URL=http://127.0.0.1:%LOCAL_PORT%/api/health"
set "PUBLIC_URL="
set "LAN_IP="

goto :main

rem Detect one usable LAN IPv4 address on this Windows machine.
:detect_lan_ip
for /f "usebackq delims=" %%I in (`powershell.exe -NoProfile -Command "$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' -and $_.InterfaceAlias -notmatch 'Loopback|vEthernet|WSL|Hyper-V|Bluetooth' }; if ($ips) { ($ips | Select-Object -First 1 -ExpandProperty IPAddress) }"`) do (
  set "LAN_IP=%%I"
)
if defined LAN_IP set "PUBLIC_URL=http://%LAN_IP%:%LOCAL_PORT%/"
exit /b 0

rem Only treat the tunnel as healthy when the CEFR app health endpoint says ok=true.
:check_site
powershell.exe -NoProfile -Command "try { $json = Invoke-RestMethod -TimeoutSec 4 -Uri '%HEALTH_URL%'; if ($json.ok -eq $true) { exit 0 }; exit 1 } catch { exit 1 }" >nul 2>nul
exit /b %errorlevel%

rem If the file is run as Administrator, add an inbound firewall rule for this port.
:ensure_firewall_rule
net session >nul 2>nul
if errorlevel 1 exit /b 0
netsh advfirewall firewall show rule name="CEFR SSH Tunnel %LOCAL_PORT%" >nul 2>nul
if not errorlevel 1 exit /b 0
netsh advfirewall firewall add rule name="CEFR SSH Tunnel %LOCAL_PORT%" dir=in action=allow protocol=TCP localport=%LOCAL_PORT% >nul 2>nul
exit /b 0

:main
call :detect_lan_ip

where ssh.exe >nul 2>nul
if errorlevel 1 (
  echo OpenSSH client was not found. Install the Windows OpenSSH Client first.
  pause
  exit /b 1
)

netstat -ano -p tcp | findstr /r /c:":%LOCAL_PORT% .*LISTENING" >nul
if not errorlevel 1 (
  call :check_site
  if not errorlevel 1 (
    echo CEFR site is already available at %LOCAL_URL%
    if defined PUBLIC_URL echo Other devices can use %PUBLIC_URL%
    start "" %LOCAL_URL%
    exit /b 0
  )
  rem Only kill a stale SSH tunnel listener that belongs to ssh.exe.
  for /f "tokens=5" %%P in ('netstat -ano -p tcp ^| findstr /r /c:":%LOCAL_PORT% .*LISTENING"') do (
    tasklist /fi "PID eq %%P" /nh | findstr /i /c:"ssh.exe" >nul
    if not errorlevel 1 taskkill /pid %%P /t /f >nul 2>nul
  )
  ping 127.0.0.1 -n 2 >nul
  netstat -ano -p tcp | findstr /r /c:":%LOCAL_PORT% .*LISTENING" >nul
  if errorlevel 1 goto :main
  echo Port %LOCAL_PORT% is occupied by a service that is not this CEFR site.
  echo Close that service, then run this file again.
  pause
  exit /b 1
)

echo Connecting to the CEFR site...
call :ensure_firewall_rule
start "CEFR SSH tunnel" /b ssh.exe -N -g -L 0.0.0.0:%LOCAL_PORT%:127.0.0.1:%REMOTE_PORT% -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 %SSH_HOST%
rem ping avoids timeout.exe's input-redirection issue when launched by PowerShell.
ping 127.0.0.1 -n 4 >nul

netstat -ano -p tcp | findstr /r /c:":%LOCAL_PORT% .*LISTENING" >nul
if errorlevel 1 (
  echo The SSH tunnel could not be started.
  echo Check that the snxy-dev SSH configuration and private key are available.
  pause
  exit /b 1
)

call :check_site
if errorlevel 1 (
  echo The SSH tunnel was created, but the CEFR site did not respond correctly.
  echo Wait a moment and run this file again.
  pause
  exit /b 1
)

echo CEFR site is available at %LOCAL_URL%
if defined PUBLIC_URL (
  echo Other devices on the same network can use %PUBLIC_URL%
) else (
  echo Could not detect a LAN IP automatically. Other devices may still be able to use your current machine IP.
)
echo If other devices still cannot connect, run this file once as Administrator to add the firewall rule.
start "" %LOCAL_URL%
exit /b 0
