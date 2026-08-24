@echo off
setlocal EnableExtensions

set "LOCAL_PORT=13000"
set "INREAD_URL=http://127.0.0.1:%LOCAL_PORT%/"

where ssh.exe >nul 2>nul
if errorlevel 1 (
  echo OpenSSH client was not found. Install the Windows OpenSSH Client first.
  pause
  exit /b 1
)

netstat -ano -p tcp | findstr /r /c:":%LOCAL_PORT% .*LISTENING" >nul
if not errorlevel 1 (
  echo InRead is already available at %INREAD_URL%
  start "" %INREAD_URL%
  exit /b 0
)

echo Connecting to InRead...
start "InRead SSH tunnel" /b ssh.exe -N -L 127.0.0.1:%LOCAL_PORT%:127.0.0.1:3000 -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 snxy-dev
timeout /t 3 /nobreak >nul

netstat -ano -p tcp | findstr /r /c:":%LOCAL_PORT% .*LISTENING" >nul
if errorlevel 1 (
  echo The SSH tunnel could not be started.
  echo Check that the snxy-dev SSH configuration and private key are available.
  pause
  exit /b 1
)

echo InRead is available at %INREAD_URL%
start "" %INREAD_URL%
exit /b 0
