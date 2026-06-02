@echo off
REM ============================================================
REM  Avaliacao Neonatal SBP 2022 - Iniciar dev server (Vite)
REM ============================================================
setlocal ENABLEDELAYEDEXPANSION
chcp 65001 >nul

cd /d "%~dp0"

echo.
echo ============================================================
echo   Avaliacao Neonatal SBP 2022 - Subindo dev server (Vite)
echo ============================================================
echo.

REM --- Verifica Node.js -------------------------------------------------
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado no PATH.
    echo        Instale em: https://nodejs.org/  ^(versao 18+^)
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VERSION=%%v
echo [OK] Node.js !NODE_VERSION! detectado.

REM --- Instala dependencias se necessario -------------------------------
if not exist "node_modules" (
    echo.
    echo [INFO] Instalando dependencias  npm install ...
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    )
)

REM --- Descobre IP local da rede (Wi-Fi/Ethernet) -----------------------
set LOCAL_IP=
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /R /C:"IPv4.*: "') do (
    set "CANDIDATE=%%i"
    set "CANDIDATE=!CANDIDATE: =!"
    if "!LOCAL_IP!"=="" set LOCAL_IP=!CANDIDATE!
)
if "!LOCAL_IP!"=="" set LOCAL_IP=^<seu-ip-local^>

echo.
echo ============================================================
echo   Servidor pronto para iniciar
echo ------------------------------------------------------------
echo   No seu PC:
echo     http://localhost:5173
echo.
echo   Em CELULARES e outros PCs da rede:
echo     http://!LOCAL_IP!:5173
echo.
echo   Para parar:      Ctrl+C  OU  rode stop.bat
echo ============================================================
echo.

REM --- Abre o navegador automaticamente ---------------------------------
start "" "http://localhost:5173"

REM --- Sobe o dev server Vite -------------------------------------------
call npm run dev

endlocal
