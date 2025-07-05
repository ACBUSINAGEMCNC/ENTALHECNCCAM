@echo off
echo ========================================
echo   DESINSTALADOR ENTALHE CNC CAM
echo ========================================
echo.

REM Verifica privilégios de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Necessário executar como Administrador!
    echo.
    echo Por favor, clique com botão direito neste arquivo
    echo e selecione "Executar como administrador"
    echo.
    pause
    exit /b 1
)

echo Executando como Administrador - OK
echo.

set "INSTALL_DIR=%PROGRAMFILES%\EntalheCNC_CAM"

echo Você está prestes a desinstalar o ENTALHE CNC CAM.
echo Todos os arquivos em "%INSTALL_DIR%" serão removidos.
echo.
echo Digite "CONFIRMAR" (sem aspas) para continuar ou feche esta janela para cancelar:
set /p CONFIRM=""

if /i not "%CONFIRM%"=="CONFIRMAR" (
    echo.
    echo Desinstalação cancelada pelo usuário.
    pause
    exit /b 1
)

echo.
echo Iniciando desinstalação...

REM Remove atalhos
echo Removendo atalhos...
if exist "%USERPROFILE%\Desktop\EntalheCNC CAM.lnk" del "%USERPROFILE%\Desktop\EntalheCNC CAM.lnk"
if exist "%USERPROFILE%\OneDrive\Desktop\EntalheCNC CAM.lnk" del "%USERPROFILE%\OneDrive\Desktop\EntalheCNC CAM.lnk"
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\EntalheCNC CAM\EntalheCNC CAM.lnk" del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\EntalheCNC CAM\EntalheCNC CAM.lnk"
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\EntalheCNC CAM" rmdir "%APPDATA%\Microsoft\Windows\Start Menu\Programs\EntalheCNC CAM"

REM Remove registro do sistema
echo Removendo registro do sistema...
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EntalheCNC_CAM" /f >nul 2>&1

REM Remove pasta do AppData
echo Removendo dados do usuário...
if exist "%APPDATA%\EntalheCNC_CAM" rmdir /s /q "%APPDATA%\EntalheCNC_CAM"

REM Remove diretório de instalação
echo Removendo arquivos do programa...
if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%"

echo.
echo ========================================
echo   DESINSTALAÇÃO CONCLUÍDA COM SUCESSO
echo ========================================
echo.
pause
