@echo off
chcp 65001 >nul
cls

echo ========================================
echo   TESTE DE INSTALAÇÃO - ENTALHE CNC CAM
echo ========================================
echo.

echo 🔍 Verificando instalação...
echo.

REM Verifica se o executável foi instalado
if exist "C:\Program Files\EntalheCNC_CAM\EntalheCNC_CAM.exe" (
    echo ✅ Executável instalado: C:\Program Files\EntalheCNC_CAM\EntalheCNC_CAM.exe
) else (
    echo ❌ Executável NÃO encontrado
)

REM Verifica arquivo de chaves
if exist "C:\Program Files\EntalheCNC_CAM\valid_keys.json" (
    echo ✅ Arquivo de chaves instalado: valid_keys.json
) else (
    echo ❌ Arquivo de chaves NÃO encontrado
)

REM Verifica atalho na área de trabalho
if exist "%USERPROFILE%\Desktop\EntalheCNC CAM.lnk" (
    echo ✅ Atalho criado na área de trabalho
) else (
    echo ❌ Atalho NÃO encontrado na área de trabalho
)

REM Verifica entrada no menu iniciar
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\EntalheCNC CAM\EntalheCNC CAM.lnk" (
    echo ✅ Entrada criada no menu iniciar
) else (
    echo ❌ Entrada NÃO encontrada no menu iniciar
)

REM Verifica registro no sistema
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EntalheCNC_CAM" >nul 2>&1
if %errorlevel% eq 0 (
    echo ✅ Aplicativo registrado no sistema
) else (
    echo ❌ Aplicativo NÃO registrado no sistema
)

echo.
echo 📋 Conteúdo da pasta de instalação:
dir "C:\Program Files\EntalheCNC_CAM" 2>nul

echo.
echo 🔑 Chave de licença disponível:
echo    ENTALHE-55C94-945ED-4C8AE
echo    Cliente: artcompany
echo    Válida até: 07/03/2039

echo.
echo ========================================
echo   TESTE CONCLUÍDO
echo ========================================
pause
