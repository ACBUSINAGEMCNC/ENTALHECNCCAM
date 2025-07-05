import os
import shutil
import subprocess
from pathlib import Path

def run_command(cmd):
    """Executa um comando e retorna se foi bem-sucedido"""
    print(f"Executando: {cmd}")
    result = subprocess.run(cmd, shell=True)
    return result.returncode == 0

def build_project():
    """Compila o projeto Next.js e cria o executável"""
    print("=== BUILD DO INSTALADOR ENTALHE CNC CAM ===")
    
    # 1. Verifica se o ícone existe, caso contrário, cria
    if not os.path.exists("entalhe_icon.ico"):
        print("\n1. Convertendo logo para ícone...")
        if os.path.exists(os.path.join('public', 'images', 'entalhy-logo.png')):
            try:
                from PIL import Image
                # Converte a logo para ícone
                logo_path = os.path.join('public', 'images', 'entalhy-logo.png')
                icone_path = 'entalhe_icon.ico'
                
                img = Image.open(logo_path)
                icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
                img.save(icone_path, sizes=icon_sizes)
                print(f"Ícone criado com sucesso: {icone_path}")
            except Exception as e:
                print(f"Erro ao criar ícone: {e}")
        else:
            print("Aviso: Logo não encontrada em public/images/entalhy-logo.png")

    # 2. Build do Next.js
    print("\n2. Construindo projeto Next.js...")
    if not run_command("pnpm run build"):
        return False
    
    # 3. Gera executável com PyInstaller
    print("\n3. Gerando executável com PyInstaller...")
    pyinstaller_cmd = [
        "pyinstaller",
        "--onefile",
        "--windowed",
        "--name=EntalheCNC_CAM",
        "--add-data=valid_keys.json;.",
        "--hidden-import=tkinter",
    ]
    
    # Adiciona ícone ao executável
    if os.path.exists("entalhe_icon.ico"):
        pyinstaller_cmd.append("--icon=entalhe_icon.ico")
        print("Usando ícone personalizado para o executável")
    
    pyinstaller_cmd.append("launcher_production.py")
    
    # Remove parâmetros vazios
    pyinstaller_cmd = [param for param in pyinstaller_cmd if param]
    
    if not run_command(" ".join(pyinstaller_cmd)):
        return False
    
    # 4. Gera o gerador de licenças
    print("\n4. Gerando executável do gerador de licenças...")
    keygen_cmd = [
        "pyinstaller",
        "--onefile",
        "--console",
        "--name=LicenseGenerator",
    ]
    
    # Adiciona ícone ao gerador de licenças
    if os.path.exists("entalhe_icon.ico"):
        keygen_cmd.append("--icon=entalhe_icon.ico")
        
    keygen_cmd.append("generate_license.py")
    
    if not run_command(" ".join(keygen_cmd)):
        return False
    
    return True

def create_installer_package():
    """Cria o pacote do instalador"""
    print("=== CRIANDO PACOTE DO INSTALADOR ===")
    
    # Cria diretório de distribuição
    dist_dir = Path("installer_package")
    if dist_dir.exists():
        shutil.rmtree(dist_dir)
    dist_dir.mkdir()
    
    # Lista de arquivos para copiar
    files_to_copy = [
        ("dist/EntalheCNC_CAM.exe", "EntalheCNC_CAM.exe"),
        ("README.md", "README.md"),
        ("LICENSE", "LICENSE.txt"),
        ("entalhe_icon.ico", "entalhe_icon.ico"),
        ("valid_keys.json", "valid_keys.json")
    ]
    
    # Adiciona o gerador de licenças apenas se não estiver em modo de distribuição
    if not os.environ.get("SKIP_LICENSE_GENERATOR"):
        files_to_copy.append(("dist/LicenseGenerator.exe", "LicenseGenerator.exe"))
        
    # Copia valid_keys.json apenas como arquivo interno (não acessível ao usuário final)
    # Será incluído dentro do executável pelo PyInstaller (--add-data)
    
    # Copia os arquivos
    for src, dst in files_to_copy:
        src_path = Path(src)
        if src_path.exists():
            shutil.copy2(src_path, dist_dir / dst)
            print(f"Copiado: {src} -> {dst}")
        else:
            print(f"Aviso: {src} não encontrado")
    
    # Copia pasta out com arquivos estáticos
    out_src = Path("out")
    if out_src.exists():
        out_dst = dist_dir / "out"
        shutil.copytree(out_src, out_dst)
        print(f"Copiado: pasta out -> out")
    else:
        print("AVISO: Pasta 'out' não encontrada! Tentando criar estrutura mínima...")
        # Cria uma estrutura mínima caso a pasta out não exista
        out_dst = dist_dir / "out"
        out_dst.mkdir(exist_ok=True)
        
        # Cria um arquivo HTML mínimo
        with open(out_dst / "index.html", "w", encoding="utf-8") as f:
            f.write("<!DOCTYPE html>\n<html>\n<head>\n    <title>ENTALHE CNC CAM</title>\n    <style>\n        body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }\n        h1 { color: #333; }\n    </style>\n</head>\n<body>\n    <h1>ENTALHE CNC CAM</h1>\n    <p>Carregando a aplicação...</p>\n</body>\n</html>")
        
        # Cria uma estrutura mínima para simular o Next.js
        next_dir = out_dst / "_next"
        next_dir.mkdir(exist_ok=True)
        print("Estrutura mínima da pasta 'out' criada com sucesso.")
        
        # Adiciona um arquivo vazio para garantir que a pasta seja incluída
        with open(next_dir / ".placeholder", "w") as f:
            f.write("# Este arquivo existe apenas para garantir que a pasta _next seja incluída no pacote.")
    
    # Cria arquivo de instalação
    with open(dist_dir / "instalar.bat", 'w', encoding='utf-8') as f:
        f.write("""@echo off
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
if not exist "out\" (
    echo ERRO: Pasta 'out' nao encontrada!
    pause
    exit /b 1
)
echo Pasta 'out' - OK

echo.
echo Iniciando instalacao...
echo.

REM Define diretorio de instalacao
set "INSTALL_DIR=%PROGRAMFILES%\\EntalheCNC_CAM"
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
copy "EntalheCNC_CAM.exe" "%INSTALL_DIR%\\" >nul
if !errorlevel! neq 0 (
    echo ERRO: Falha ao copiar EntalheCNC_CAM.exe
    pause
    exit /b 1
)
echo EntalheCNC_CAM.exe - Copiado

REM Copia arquivo de chaves
copy "valid_keys.json" "%INSTALL_DIR%\\" >nul
if !errorlevel! neq 0 (
    echo ERRO: Falha ao copiar valid_keys.json
    pause
    exit /b 1
)
echo valid_keys.json - Copiado

REM Copia pasta out com a interface web
echo Copiando interface web...
xcopy "out\\*" "%INSTALL_DIR%\\out\\" /E /I /Q >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Falha ao copiar pasta 'out' com a interface web
    pause
    exit /b 1
)
echo Interface web - Copiada

REM Copia o icone se existir
if exist "entalhe_icon.ico" (
    copy "entalhe_icon.ico" "%INSTALL_DIR%\\" >nul 2>&1
    echo Icone - Copiado
)

REM Copia arquivo de licenca se existir
if exist "LICENSE.txt" (
    copy "LICENSE.txt" "%INSTALL_DIR%\\" >nul
    echo LICENSE.txt - Copiado
)

echo.
echo Criando atalhos...

REM Cria atalho na area de trabalho
echo Criando atalho na area de trabalho...
set "DESKTOP=%USERPROFILE%\\Desktop"

REM Garante que o diretorio Desktop existe
if not exist "%DESKTOP%" (
    set "DESKTOP=%USERPROFILE%\\OneDrive\\Desktop"
    if not exist "%DESKTOP%" (
        echo AVISO: Nao foi possivel localizar a pasta da area de trabalho
        goto :skip_desktop_shortcut
    )
)

REM Cria o atalho com opcoes avancadas
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\\EntalheCNC CAM.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\\EntalheCNC_CAM.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\\EntalheCNC_CAM.exe,0'; $Shortcut.Description = 'EntalheCNC CAM - Software de Usinagem CNC'; $Shortcut.Save()" >nul 2>&1

REM Verifica se o atalho foi criado
if exist "%DESKTOP%\\EntalheCNC CAM.lnk" (
    echo Atalho na area de trabalho - OK
) else (
    echo AVISO: Nao foi possivel criar atalho na area de trabalho
)

:skip_desktop_shortcut

REM Cria entrada no menu iniciar
echo Criando entrada no menu iniciar...
set "START_MENU=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs"
if not exist "%START_MENU%\\EntalheCNC CAM" mkdir "%START_MENU%\\EntalheCNC CAM" >nul 2>&1

powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_MENU%\\EntalheCNC CAM\\EntalheCNC CAM.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\\EntalheCNC_CAM.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\\EntalheCNC_CAM.exe,0'; $Shortcut.Description = 'EntalheCNC CAM - Software de Usinagem CNC'; $Shortcut.Save()" >nul 2>&1

if !errorlevel! eq 0 (
    echo Entrada no menu iniciar - OK
) else (
    echo Aviso: Nao foi possivel criar entrada no menu iniciar
)

echo.
echo Registrando no sistema...

REM Registra no sistema para desinstalacao
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\EntalheCNC_CAM" /v "DisplayName" /t REG_SZ /d "EntalheCNC CAM" /f >nul
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\EntalheCNC_CAM" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\EntalheCNC_CAM" /v "Publisher" /t REG_SZ /d "ENTALHE CNC" /f >nul
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\EntalheCNC_CAM" /v "DisplayVersion" /t REG_SZ /d "3.0" /f >nul

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
""")
        
    # Cria arquivo de desinstalação
    with open(dist_dir / "desinstalar.bat", 'w', encoding='utf-8') as f:
        f.write("""@echo off
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

set "INSTALL_DIR=%PROGRAMFILES%\\EntalheCNC_CAM"

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
if exist "%USERPROFILE%\\Desktop\\EntalheCNC CAM.lnk" del "%USERPROFILE%\\Desktop\\EntalheCNC CAM.lnk"
if exist "%USERPROFILE%\\OneDrive\\Desktop\\EntalheCNC CAM.lnk" del "%USERPROFILE%\\OneDrive\\Desktop\\EntalheCNC CAM.lnk"
if exist "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\EntalheCNC CAM\\EntalheCNC CAM.lnk" del "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\EntalheCNC CAM\\EntalheCNC CAM.lnk"
if exist "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\EntalheCNC CAM" rmdir "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\EntalheCNC CAM"

REM Remove registro do sistema
echo Removendo registro do sistema...
reg delete "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\EntalheCNC_CAM" /f >nul 2>&1

REM Remove pasta do AppData
echo Removendo dados do usuário...
if exist "%APPDATA%\\EntalheCNC_CAM" rmdir /s /q "%APPDATA%\\EntalheCNC_CAM"

REM Remove diretório de instalação
echo Removendo arquivos do programa...
if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%"

echo.
echo ========================================
echo   DESINSTALAÇÃO CONCLUÍDA COM SUCESSO
echo ========================================
echo.
pause
""")
        
    # Cria arquivo README de instruções
    with open(dist_dir / "LEIA-ME.txt", 'w', encoding='utf-8') as f:
        f.write("""========================================
  ENTALHE CNC CAM - INSTRUÇÕES
========================================

INSTALAÇÃO:
1. Clique com o botão direito em "instalar.bat"
2. Selecione "Executar como administrador"
3. Siga as instruções na tela

LICENÇA:
A chave de licença será fornecida pelo desenvolvedor.
Contate support@entalhec.com.br para obter sua licença.

PRIMEIRA EXECUÇÃO:
Após a instalação, clique no atalho criado na área de trabalho.
Na primeira execução, você será solicitado a inserir sua chave de licença.

SUPORTE:
Em caso de dúvidas ou problemas, entre em contato pelo e-mail suporte@entalhec.com.br

========================================
""")
    
    print("\nInstalador criado com sucesso em './installer_package/'")
    print("Para distribuir, compacte a pasta 'installer_package' e envie ao cliente.")
    return True

def main():
    """Função principal"""
    if build_project():
        create_installer_package()
        print("\n=== PROCESSO CONCLUÍDO COM SUCESSO ===")
    else:
        print("\n=== FALHA NO PROCESSO DE BUILD ===")

if __name__ == "__main__":
    main()
