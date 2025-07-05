@echo off
echo ===== SCRIPT DE BUILD COMPLETO COM ELECTRON =====
echo.

REM Navega para o diretório do projeto (onde este script está localizado)
cd /d "%~dp0"
echo Diretório atual: %CD%
echo.

REM Verifica se o package.json existe
if not exist "package.json" (
    echo ERRO: package.json não encontrado no diretório atual!
    echo Certifique-se de executar este script do diretório raiz do projeto.
    pause
    exit /b 1
)

REM Configura o pnpm para permitir scripts de pós-instalação do Electron
echo Configurando pnpm para permitir scripts do Electron...
call pnpm config set --location project auto-install-peers true
call pnpm config set --location project strict-peer-dependencies false
call pnpm config set unsafe-perm true
call pnpm config set node-linker hoisted

REM Lista de pacotes que precisam ter scripts aprovados
echo Permitindo scripts de pós-instalação para pacotes específicos...
call pnpm config set public-hoist-pattern[]=*electron*
call pnpm config set public-hoist-pattern[]=*node-gyp*
call pnpm config set --location project enable-pre-post-scripts true

REM Reinstala as dependências com as novas configurações
echo.
echo Reinstalando dependências com as novas configurações...
call pnpm install --force

REM Executa o build do Next.js
echo.
echo Executando build do Next.js...
call pnpm run build

echo.
if %errorlevel% EQU 0 (
    echo Build concluído com sucesso! Agora você pode continuar com:
    echo python build_final.py
) else (
    echo Houve um problema durante o build. Verifique os erros acima.
)

pause
