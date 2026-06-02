@echo off
REM ============================================================
REM  Avaliacao Neonatal SBP 2022 - Primeira subida ao GitHub
REM ============================================================
REM
REM  USO:
REM    enviar_git_documentado_rapido.bat
REM
REM  O QUE FAZ (idempotente):
REM    1. Verifica que o git esta no PATH.
REM    2. Inicializa o repo local se ainda nao existir (.git).
REM    3. Garante a branch principal "main".
REM    4. Configura o remote "origin" para o repo do GitHub.
REM    5. Faz git add -A.
REM    6. Cria commit inicial "chore: bootstrap repo" (se houver mudancas).
REM    7. Faz push -u origin main.
REM
REM  PRE-REQUISITOS:
REM    - Git instalado (https://git-scm.com/)
REM    - Repo ja criado em https://github.com/renato-RCM/Avaliacao_Neonatal_SBP_2022
REM      (vazio, sem README/.gitignore inicial — caso contrario o push
REM       vai falhar com "non-fast-forward"; nesse caso siga as instrucoes
REM       que aparecerao no terminal).
REM    - Autenticacao Git configurada (HTTPS com PAT/Credential Manager
REM      ou SSH key cadastrada no GitHub).
REM ============================================================

setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

set REPO_URL=https://github.com/renato-RCM/Avaliacao_Neonatal_SBP_2022.git
set BRANCH=main

echo.
echo ============================================================
echo   Enviando projeto para o GitHub
echo   Repo: %REPO_URL%
echo ============================================================
echo.

REM ---------- 1) Verifica git ----------
where git >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Git nao encontrado no PATH.
  echo        Instale em https://git-scm.com/ e rode novamente.
  pause
  exit /b 1
)

REM ---------- 2) git init se necessario ----------
if not exist ".git\" (
  echo [1/6] Inicializando repositorio Git...
  git init
  if errorlevel 1 (
    echo [ERRO] git init falhou.
    pause
    exit /b 1
  )
) else (
  echo [1/6] Repositorio Git ja existe.
)

REM ---------- 3) Garante branch main ----------
echo [2/6] Garantindo branch principal "%BRANCH%"...
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CUR_BRANCH=%%b"
if "!CUR_BRANCH!"=="HEAD" set CUR_BRANCH=
if "!CUR_BRANCH!"=="" (
  REM Repo recem inicializado, sem commits ainda
  git symbolic-ref HEAD refs/heads/%BRANCH%
) else if /I not "!CUR_BRANCH!"=="%BRANCH%" (
  git branch -M %BRANCH%
)

REM ---------- 4) Configura remote origin ----------
echo [3/6] Configurando remote origin...
git remote get-url origin >nul 2>nul
if errorlevel 1 (
  git remote add origin %REPO_URL%
  echo    remote origin adicionado: %REPO_URL%
) else (
  for /f "delims=" %%u in ('git remote get-url origin') do set "CUR_REMOTE=%%u"
  if /I not "!CUR_REMOTE!"=="%REPO_URL%" (
    echo    remote atual: !CUR_REMOTE!
    echo    atualizando para: %REPO_URL%
    git remote set-url origin %REPO_URL%
  ) else (
    echo    remote origin ja esta correto.
  )
)

REM ---------- 5) Stage + commit inicial ----------
echo [4/6] Stage de arquivos (git add -A)...
git add -A

git diff --cached --quiet
if errorlevel 1 (
  echo [5/6] Criando commit inicial...
  REM Tenta detectar se ja ha commits
  git rev-parse --verify HEAD >nul 2>nul
  if errorlevel 1 (
    git commit -m "chore: bootstrap initial commit - Avaliacao Neonatal SBP 2022"
  ) else (
    git commit -m "chore: bootstrap repo - sincronizando arquivos iniciais"
  )
  if errorlevel 1 (
    echo [ERRO] Falha ao commitar.
    pause
    exit /b 1
  )
) else (
  echo [5/6] Sem mudancas pendentes - vou apenas tentar o push.
)

REM ---------- 6) Push ----------
echo [6/6] Enviando para origin/%BRANCH%...
echo.
git push -u origin %BRANCH%
if errorlevel 1 (
  echo.
  echo [AVISO] O push falhou. Causas mais comuns:
  echo.
  echo   1. O repo remoto JA tem commits (foi criado com README/.gitignore).
  echo      Solucao 1 - integrar:
  echo          git pull origin %BRANCH% --allow-unrelated-histories
  echo          git push -u origin %BRANCH%
  echo      Solucao 2 - sobrescrever (CUIDADO, apaga remote):
  echo          git push -u origin %BRANCH% --force
  echo.
  echo   2. Voce nao esta autenticado no GitHub.
  echo      Configure um PAT (Personal Access Token) ou SSH key.
  echo      https://docs.github.com/en/authentication
  echo.
  echo   3. O repo nao foi criado em:
  echo      https://github.com/renato-RCM/Avaliacao_Neonatal_SBP_2022
  echo.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo  OK! Projeto enviado para %REPO_URL%
echo  Branch: %BRANCH%
echo ============================================================
echo.
echo  Proximo passo: rodar publish.bat para criar release com tag
echo  Exemplo:
echo      publish.bat v1.0.0 latest
echo.
endlocal
exit /b 0
