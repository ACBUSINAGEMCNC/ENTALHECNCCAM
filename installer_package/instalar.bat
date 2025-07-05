@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    INSTALADOR ENTALHE CNC CAM v3.0
echo ========================================
echo.

REM Forca execucao no diretorio do script
cd /d "%~dp0"
echo Diretorio atual: %CD%
echo.

REM Verifica privilegios de administrador
echo Verificando privilegios...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Necessario executar como Administrador!
    echo.
    echo Por favor, clique com botao direito neste arquivo
    echo e selecione "Executar como administrador"
    echo.
    pause
    exit /b 1
)
echo Executando como Administrador - OK

echo.
echo Verificando arquivos necessarios...

REM Verifica arquivo principal
if not exist "EntalheCNC_CAM.exe" (
    echo ERRO: EntalheCNC_CAM.exe nao encontrado!
    pause
    exit /b 1
)
echo EntalheCNC_CAM.exe - OK

REM Verifica arquivo de chaves
if not exist "valid_keys.json" (
    echo ERRO: valid_keys.json nao encontrado!
    pause
    exit /b 1
)
echo valid_keys.json - OK

REM Verifica pasta out
if not exist "out" (
    echo ERRO: Pasta 'out' nao encontrada!
    pause
    exit /b 1
)
echo Pasta 'out' - OK

echo.
echo Iniciando instalacao...
echo.

REM Define diretorio de instalacao
set "INSTALL_DIR=%PROGRAMFILES%\EntalheCNC_CAM"
echo Destino: %INSTALL_DIR%

REM Cria diretorio se nao existir
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    if !errorlevel! neq 0 (
        echo ERRO: Falha ao criar diretorio
        pause
        exit /b 1
    )
)

echo.
echo Copiando arquivos...

REM Copia arquivo principal
copy "EntalheCNC_CAM.exe" "%INSTALL_DIR%\" >nul
if !errorlevel! neq 0 (
    echo ERRO: Falha ao copiar EntalheCNC_CAM.exe
    pause
    exit /b 1
)
echo EntalheCNC_CAM.exe - Copiado

REM Copia arquivo de chaves
copy "valid_keys.json" "%INSTALL_DIR%\" >nul
if !errorlevel! neq 0 (
    echo ERRO: Falha ao copiar valid_keys.json
    pause
    exit /b 1
)
echo valid_keys.json - Copiado

REM Copia pasta out com a interface web
echo Copiando interface web...
xcopy "out\*" "%INSTALL_DIR%\out\" /E /I /Q >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Falha ao copiar pasta 'out' com a interface web
    pause
    exit /b 1
)
echo Interface web - Copiada

REM Copia o icone se existir
if exist "entalhe_icon.ico" (
    copy "entalhe_icon.ico" "%INSTALL_DIR%\" >nul 2>&1
    echo Icone - Copiado
)

REM Copia arquivo de licenca se existir
if exist "LICENSE.txt" (
    copy "LICENSE.txt" "%INSTALL_DIR%\" >nul
    echo LICENSE.txt - Copiado
)

echo.
echo Criando atalhos...

REM Cria atalho na area de trabalho
echo Criando atalho na area de trabalho...
set "DESKTOP=%USERPROFILE%\Desktop"

REM Garante que o diretorio Desktop existe
if not exist "%DESKTOP%" (
    set "DESKTOP=%USERPROFILE%\OneDrive\Desktop"
    if not exist "%DESKTOP%" (
        echo AVISO: Nao foi possivel localizar a pasta da area de trabalho
        goto :skip_desktop_shortcut
    )
)

REM Cria o atalho com opcoes avancadas
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\EntalheCNC CAM.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\EntalheCNC_CAM.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\EntalheCNC_CAM.exe,0'; $Shortcut.Description = 'EntalheCNC CAM - Software de Usinagem CNC'; $Shortcut.Save()" >nul 2>&1

REM Verifica se o atalho foi criado
if exist "%DESKTOP%\EntalheCNC CAM.lnk" (
    echo Atalho na area de trabalho - OK
) else (
    echo AVISO: Nao foi possivel criar atalho na area de trabalho
)

:skip_desktop_shortcut

REM Cria entrada no menu iniciar
echo Criando entrada no menu iniciar...
set "START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
if not exist "%START_MENU%\EntalheCNC CAM" mkdir "%START_MENU%\EntalheCNC CAM" >nul 2>&1

powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_MENU%\EntalheCNC CAM\EntalheCNC CAM.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\EntalheCNC_CAM.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\EntalheCNC_CAM.exe,0'; $Shortcut.Description = 'EntalheCNC CAM - Software de Usinagem CNC'; $Shortcut.Save()" >nul 2>&1

if !errorlevel! eq 0 (
    echo Entrada no menu iniciar - OK
) else (
    echo Aviso: Nao foi possivel criar entrada no menu iniciar
)

echo.
echo Registrando no sistema...

REM Registra no sistema para desinstalacao
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EntalheCNC_CAM" /v "DisplayName" /t REG_SZ /d "EntalheCNC CAM" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EntalheCNC_CAM" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EntalheCNC_CAM" /v "Publisher" /t REG_SZ /d "ENTALHE CNC" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EntalheCNC_CAM" /v "DisplayVersion" /t REG_SZ /d "3.0" /f >nul

echo Registro no sistema - OK

echo.
echo ========================================
echo    INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo INFORMACOES DA INSTALACAO:
echo    Local: %INSTALL_DIR%
echo    Atalho: Area de trabalho
echo    Menu: Menu Iniciar
echo.
echo A LICENÇA SERÁ FORNECIDA PELO DESENVOLVEDOR
echo.
echo PROXIMOS PASSOS:
echo  1. Clique no atalho "EntalheCNC CAM" na area de trabalho
echo  2. Digite sua chave quando solicitado
echo  3. Comece a usar o software!
echo.

pause
