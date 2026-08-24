@echo off
setlocal EnableExtensions

set "LOCAL_PORT=13000"
set "INREAD_URL=http://127.0.0.1:%LOCAL_PORT%/"

goto :main

rem Only open the browser after the local port is confirmed to serve InRead 2.0.
:check_inread
powershell.exe -NoProfile -Command "try { $page = Invoke-WebRequest -UseBasicParsing -TimeoutSec 4 -Uri '%INREAD_URL%'; if ($page.StatusCode -eq 200 -and $page.Content -match 'InRead') { exit 0 }; exit 1 } catch { exit 1 }" >nul 2>nul
exit /b %errorlevel%

:main
where ssh.exe >nul 2>nul
if errorlevel 1 (
  echo OpenSSH client was not found. Install the Windows OpenSSH Client first.
  pause
  exit /b 1
)

netstat -ano -p tcp | findstr /r /c:":%LOCAL_PORT% .*LISTENING" >nul
if not errorlevel 1 (
  call :check_inread
  if not errorlevel 1 (
    echo InRead 2.0 is already available at %INREAD_URL%
    start "" %INREAD_URL%
    exit /b 0
  )
  echo Port %LOCAL_PORT% is occupied by a service that is not InRead 2.0.
  echo Close that service, then run this file again.
  pause
  exit /b 1
)

echo Connecting to InRead...
start "InRead SSH tunnel" /b ssh.exe -N -L 127.0.0.1:%LOCAL_PORT%:127.0.0.1:3000 -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 snxy-dev
rem ping avoids timeout.exe's input-redirection failure when launched by PowerShell.
ping 127.0.0.1 -n 4 >nul

netstat -ano -p tcp | findstr /r /c:":%LOCAL_PORT% .*LISTENING" >nul
if errorlevel 1 (
  echo The SSH tunnel could not be started.
  echo Check that the snxy-dev SSH configuration and private key are available.
  pause
  exit /b 1
)

call :check_inread
if errorlevel 1 (
  echo The SSH tunnel was created, but InRead 2.0 did not respond correctly.
  echo Wait a moment and run this file again.
  pause
  exit /b 1
)

echo InRead 2.0 is available at %INREAD_URL%
start "" %INREAD_URL%
exit /b 0
