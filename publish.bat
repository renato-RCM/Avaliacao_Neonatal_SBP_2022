@echo off
REM ============================================================
REM  Avaliacao Neonatal SBP 2022 - Build/publica imagem Docker
REM  + tag Git na mesma versao
REM ============================================================
REM
REM  USO:
REM    publish.bat                          -> pergunta a versao
REM    publish.bat v1.0.0                    -> docker + git, sem :latest
REM    publish.bat v1.0.0 latest             -> docker (+:latest) + git
REM    publish.bat v1.0.0 latest --no-git    -> so docker (+:latest), pula git
REM    publish.bat v1.0.0 --no-git           -> so docker, pula git
REM
REM  Argumentos posicionais aceitos (em qualquer ordem apos a versao):
REM    latest    -> taguea/pusha a imagem tambem como :latest no Docker Hub
REM    --no-git  -> nao mexe no repositorio Git (so publica no Docker Hub)
REM    nogit     -> sinonimo de --no-git
REM
REM  PRE-REQUISITOS:
REM    1. Docker Desktop instalado e rodando
REM    2. Logado no Docker Hub:  docker login        (conta: renatorcm)
REM    3. Para a parte Git: repo ja inicializado (.git existe) e
REM       remote "origin" configurado para o GitHub do projeto.
REM       Se voce ainda nao subiu o projeto, rode antes:
REM         enviar_git_documentado_rapido.bat
REM
REM  O QUE O PASSO GIT FAZ:
REM    1) Verifica que estamos num repo Git.
REM    2) Faz `git add -A`.
REM    3) Se houver mudancas em stage, commita com mensagem:
REM         "release: <TAG>"
REM    4) Faz push da branch atual (geralmente main).
REM    5) Cria a tag anotada <TAG> apontando para o commit atual
REM       (se ja existir local, recria localmente; se ja existir
REM       remota, o push da tag falha e o script avisa).
REM    6) Faz push da tag para origin.
REM
REM  IMPORTANTE:
REM    A imagem Docker JA FOI publicada antes da etapa Git.
REM    Qualquer falha na sincronizacao Git e tratada como AVISO
REM    e NAO aborta o script (exit code 0), porque o Docker Hub
REM    ja recebeu a imagem.
REM ============================================================

setlocal enabledelayedexpansion

set IMAGE_NAME=renatorcm/avaliacao-neonatal-sbp2022
set PROJECT_NAME=avaliacao-neonatal
set COMPOSE_FILE=docker-compose.build.yml

REM ---------- 0) Verifica que o Docker esta disponivel ----------
docker version >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ERRO] Docker nao esta rodando ou nao esta instalado.
  echo        Instale o Docker Desktop: https://www.docker.com/products/docker-desktop/
  echo.
  pause
  exit /b 1
)

REM ---------- 1) Versao ----------
set VERSION=%1
if "%VERSION%"=="" (
  set /p VERSION="Versao a publicar (ex: v1.0.0): "
)
if "%VERSION%"=="" (
  echo [ERRO] Versao vazia. Abortando.
  exit /b 1
)

REM Garante prefixo "v" no tag (mantem 1 padrao)
if "%VERSION:~0,1%"=="v" (
  set TAG=%VERSION%
) else (
  set TAG=v%VERSION%
)

REM ---------- 1.b) Parse de flags (latest / --no-git) ----------
set ALSO_LATEST=0
set SKIP_GIT=0
call :parse_flag "%~2"
call :parse_flag "%~3"

echo.
echo ============================================================
echo  Vai publicar: %IMAGE_NAME%:%TAG%
echo  Build name:   %PROJECT_NAME%   (aparece no Docker Desktop)
if "%ALSO_LATEST%"=="1" echo  Tambem como : %IMAGE_NAME%:latest
if "%SKIP_GIT%"=="1"    echo  Git:          IGNORADO (--no-git)
if "%SKIP_GIT%"=="0"    echo  Git:          tag %TAG% sera enviada para origin
echo ============================================================
echo.

REM ---------- 2) Atualiza versao no package.json ----------
set PKG_VERSION=%TAG:v=%
echo [1/5] Atualizando package.json para versao %PKG_VERSION%...
powershell -NoProfile -Command "$content = Get-Content package.json -Raw; $content = $content -replace '\""version\"":\s*\""[^\""]*\""', '\""version\"": \""%PKG_VERSION%\""'; Set-Content package.json -Value $content -NoNewline"

REM ---------- 3) Build via compose ----------
echo.
echo [2/5] Build da imagem Docker (multi-stage: Node build + nginx runtime)...
echo.
set TAG=%TAG%
docker compose -p %PROJECT_NAME% -f %COMPOSE_FILE% build --no-cache
if errorlevel 1 (
  echo.
  echo [ERRO] Falha no build. Verifique as mensagens acima.
  pause
  exit /b 1
)

REM ---------- 4) Tag :latest (opcional) ----------
if "%ALSO_LATEST%"=="1" (
  echo.
  echo [3/5] Tagueando tambem como %IMAGE_NAME%:latest
  docker tag %IMAGE_NAME%:%TAG% %IMAGE_NAME%:latest
)

REM ---------- 5) Push Docker Hub ----------
echo.
echo [4/5] docker push %IMAGE_NAME%:%TAG%
echo.
docker push %IMAGE_NAME%:%TAG%
if errorlevel 1 (
  echo.
  echo [ERRO] Falha no push. Voce esta logado?  Tente: docker login
  pause
  exit /b 1
)

if "%ALSO_LATEST%"=="1" (
  echo.
  echo Push :latest
  docker push %IMAGE_NAME%:latest
  if errorlevel 1 (
    echo [AVISO] Falha no push de :latest. A versao %TAG% ja foi enviada.
  )
)

REM ---------- 6) Sincronizar Git (mesma versao) ----------
REM A partir daqui, qualquer falha vira AVISO. Imagem ja esta no Hub.
if "%SKIP_GIT%"=="1" (
  echo.
  echo [INFO] Etapa Git pulada por flag --no-git.
  goto :docker_ok
)

echo.
echo [5/5] Sincronizando Git com a mesma versao do Docker (%TAG%)...
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [AVISO] Git nao encontrado no PATH - pulando sincronizacao Git.
  goto :docker_ok
)

if not exist ".git\" (
  echo [AVISO] Este diretorio nao e um repositorio Git.
  echo         Rode antes: enviar_git_documentado_rapido.bat
  goto :docker_ok
)

REM Stage de tudo (arquivos novos, modificados, removidos)
git add -A
if errorlevel 1 (
  echo [AVISO] Falha em "git add -A". Pulando commit/tag.
  goto :docker_ok
)

REM Commit apenas se houver mudancas em stage
git diff --cached --quiet
if errorlevel 1 (
  echo Criando commit "release: %TAG%"...
  git commit -m "release: %TAG%"
  if errorlevel 1 (
    echo [AVISO] Falha ao commitar. Tag NAO sera criada/enviada.
    goto :docker_ok
  )
) else (
  echo Sem mudancas pendentes - vou apenas criar/enviar a tag.
)

REM Descobre branch atual (geralmente main)
set "CUR_BRANCH="
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CUR_BRANCH=%%b"
if "!CUR_BRANCH!"=="" (
  echo [AVISO] Nao consegui detectar a branch atual. Pulando push.
  goto :docker_ok
)
if /I "!CUR_BRANCH!"=="HEAD" (
  echo [AVISO] HEAD destacado ^(detached^) - nao da pra dar push. Pulando.
  goto :docker_ok
)

REM Push do branch
echo Enviando branch "!CUR_BRANCH!" para origin...
git push origin !CUR_BRANCH!
if errorlevel 1 (
  echo [AVISO] Falha no push do branch. Tag NAO sera enviada.
  echo         Causas comuns: repo remoto nao criado, sem autenticacao,
  echo         ou branch divergiu. Resolva e rode novamente.
  goto :docker_ok
)

REM Cria tag anotada local (recria se ja existia local)
git tag -d %TAG% >nul 2>nul
git tag -a %TAG% -m "Release %TAG%"
if errorlevel 1 (
  echo [AVISO] Falha ao criar tag local %TAG%.
  goto :docker_ok
)

REM Push da tag - SEM force. Se ja existir remota, falha e avisa.
echo Enviando tag %TAG% para origin...
git push origin %TAG%
if errorlevel 1 (
  echo.
  echo [AVISO] Tag %TAG% nao foi enviada para origin.
  echo         Provavelmente ela JA existe no GitHub. Use uma versao
  echo         nova ou, se realmente quiser sobrescrever, rode:
  echo           git push origin :refs/tags/%TAG%
  echo           git push origin %TAG%
  goto :docker_ok
)

echo.
echo [OK] Git sincronizado: branch "!CUR_BRANCH!" + tag %TAG% enviados.

:docker_ok
echo.
echo ============================================================
echo  PRONTO! Imagem publicada: %IMAGE_NAME%:%TAG%
if "%ALSO_LATEST%"=="1" echo                       %IMAGE_NAME%:latest
if "%SKIP_GIT%"=="0"    echo  Git tag enviada:    %TAG%
echo ============================================================
echo.
echo  Proximo passo no servidor (Portainer):
echo    - Stacks ^> avaliacao-neonatal ^> Editor
echo    - Trocar a linha:
echo        image: %IMAGE_NAME%:VERSAO_ANTIGA
echo      por:
echo        image: %IMAGE_NAME%:%TAG%
echo    - Update the stack
echo.
echo  No GitHub voce vera a tag em:
echo    https://github.com/renato-RCM/Avaliacao_Neonatal_SBP_2022/releases/tag/%TAG%
echo ============================================================
endlocal
exit /b 0

REM ============================================================
REM  Subrotina: parse de uma flag (latest / --no-git / nogit)
REM ============================================================
:parse_flag
set "FLAG=%~1"
if "%FLAG%"=="" goto :eof
if /I "%FLAG%"=="latest"   set ALSO_LATEST=1
if /I "%FLAG%"=="--no-git" set SKIP_GIT=1
if /I "%FLAG%"=="nogit"    set SKIP_GIT=1
goto :eof
