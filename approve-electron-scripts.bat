@echo off
echo ===== Configurando pnpm para permitir scripts do Electron =====

REM Configura o pnpm para permitir scripts de pós-instalação do Electron
call pnpm config set --location project auto-install-peers true
call pnpm config set --location project strict-peer-dependencies false
call pnpm config set unsafe-perm true
call pnpm config set node-linker hoisted

REM Lista de pacotes que precisam ter scripts aprovados
echo Permitindo scripts de pós-instalação para Electron...
call pnpm config set public-hoist-pattern[]=*electron*
call pnpm config set public-hoist-pattern[]=*node-gyp*
call pnpm config set --location project enable-pre-post-scripts true

echo.
echo Configuração concluída! Execute os seguintes comandos para continuar:
echo.
echo 1. pnpm install --force
echo 2. pnpm run build
echo.
echo Ou execute "build-with-electron.bat" para fazer tudo automaticamente.
pause
