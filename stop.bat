@echo off
REM ============================================================
REM  Avaliacao Neonatal SBP 2022 - Parar dev server (Vite)
REM ============================================================
setlocal ENABLEDELAYEDEXPANSION
chcp 65001 >nul

echo.
echo ============================================================
echo   Encerrando processos node.exe ligados ao Vite (porta 5173)
echo ============================================================
echo.

set FOUND=0

REM Tenta encerrar pela porta 5173
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    set "PID=%%p"
    if not "!PID!"=="" (
        echo Matando PID !PID! (porta 5173)...
        taskkill /F /PID !PID! >nul 2>&1
        set FOUND=1
    )
)

REM Backup: encerra todos node.exe da pasta atual
if "!FOUND!"=="0" (
    echo Nenhum processo escutando na 5173. Tentando node.exe genericos...
    for /f "tokens=2" %%p in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH ^| findstr "node.exe"') do (
        set "PID=%%~p"
        echo Matando PID !PID!...
        taskkill /F /PID !PID! >nul 2>&1
        set FOUND=1
    )
)

if "!FOUND!"=="0" (
    echo Nenhum processo encontrado. Tudo limpo.
) else (
    echo.
    echo [OK] Processos encerrados.
)

echo.
endlocal
exit /b 0
