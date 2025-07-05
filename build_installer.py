#!/usr/bin/env python3
"""
Script para criar o instalador do ENTALHE CNC CAM
"""

import os
import subprocess
import sys
import shutil
from pathlib import Path

def run_command(cmd, cwd=None):
    """Executa um comando e retorna o resultado"""
    print(f"Executando: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Erro: {result.stderr}")
        return False
    print(f"Sucesso: {result.stdout}")
    return True

def build_nextjs():
    """Constrói o projeto Next.js"""
    print("=== CONSTRUINDO PROJETO NEXT.JS ===")
    
    # Instala dependências se necessário
    if not os.path.exists("node_modules"):
        if not run_command("pnpm install"):
            return False
    
    # Build do Next.js (já inclui export estático)
    if not run_command("pnpm run build"):
        return False
    
    return True

def build_python_exe():
    """Constrói o executável Python"""
    print("=== CONSTRUINDO EXECUTÁVEL PYTHON ===")
    
    # Instala dependências Python
    if not run_command("pip install -r requirements.txt"):
        return False
    
    # Cria o executável principal
    pyinstaller_cmd = [
        "pyinstaller",
        "--onefile",
        "--windowed",
        "--name=EntalheCNC_CAM",
        "--icon=public/favicon.ico" if os.path.exists("public/favicon.ico") else "",
        "--add-data=out;out",
        "--add-data=valid_keys.json;.",
        "--hidden-import=tkinter",
        "launcher_production.py"
    ]
    
    # Adiciona ícone ao executável
    if os.path.exists("entalhe_icon.ico"):
        pyinstaller_cmd.append("--icon=entalhe_icon.ico")
        print("Usando ícone personalizado para o executável")
    
    # Remove parâmetros vazios
    pyinstaller_cmd = [param for param in pyinstaller_cmd if param]
    
    if not run_command(" ".join(pyinstaller_cmd)):
        return False
    
    # Cria o gerador de chaves separado
    keygen_cmd = [
        "pyinstaller",
        "--onefile",
        "--console",
        "--name=LicenseGenerator",
        "--hidden-import=tkinter",
        "generate_license.py"
    ]
    
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
    
    # Copia arquivos necessários
    files_to_copy = [
        ("dist/EntalheCNC_CAM.exe", "EntalheCNC_CAM.exe"),
        ("dist/LicenseGenerator.exe", "LicenseGenerator.exe"),
        ("valid_keys.json", "valid_keys.json"),
        ("README.md", "README.md"),
        ("LICENSE", "LICENSE.txt")
    ]
    
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
        print("AVISO: Pasta 'out' não encontrada! Execute 'pnpm run build' primeiro.")
    
    # Cria arquivo de instalação
    install_script = dist_dir / "install.bat"
    with open(install_script, 'w', encoding='utf-8') as f:
        f.write("""@echo off
echo ========================================
echo INSTALADOR ENTALHE CNC CAM
echo ========================================
echo.

REM Cria diretório de instalação
set INSTALL_DIR=%PROGRAMFILES%\\EntalheCNC_CAM
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copia arquivos
echo Copiando arquivos...
copy "EntalheCNC_CAM.exe" "%INSTALL_DIR%\\"
copy "valid_keys.json" "%INSTALL_DIR%\\"
copy "LICENSE.txt" "%INSTALL_DIR%\\"

REM Cria atalho na área de trabalho
echo Criando atalho...
powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\\Desktop\\EntalheCNC CAM.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\\EntalheCNC_CAM.exe'; $Shortcut.Save()"

REM Cria entrada no menu iniciar
set START_MENU=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs
if not exist "%START_MENU%\\EntalheCNC CAM" mkdir "%START_MENU%\\EntalheCNC CAM"
powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_MENU%\\EntalheCNC CAM\\EntalheCNC CAM.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\\EntalheCNC_CAM.exe'; $Shortcut.Save()"

echo.
echo ========================================
echo INSTALAÇÃO CONCLUÍDA!
echo ========================================
echo.
echo O EntalheCNC CAM foi instalado em:
echo %INSTALL_DIR%
echo.
echo Atalhos criados:
echo - Área de trabalho
echo - Menu Iniciar
echo.
pause
""")
    
    # Cria arquivo README para o instalador
    readme_installer = dist_dir / "README_INSTALACAO.txt"
    with open(readme_installer, 'w', encoding='utf-8') as f:
        f.write("""ENTALHE CNC CAM - INSTALADOR
============================

INSTRUÇÕES DE INSTALAÇÃO:
1. Execute install.bat como Administrador
2. Aguarde a conclusão da instalação
3. Execute o programa pela primeira vez
4. Digite sua chave de licença quando solicitado

ARQUIVOS INCLUSOS:
- EntalheCNC_CAM.exe: Aplicativo principal
- LicenseGenerator.exe: Gerador de chaves (apenas para distribuidores)
- valid_keys.json: Base de chaves válidas
- install.bat: Script de instalação
- LICENSE.txt: Licença do software

SUPORTE:
Para suporte técnico, entre em contato com o desenvolvedor.

CHAVES DE LICENÇA:
- Cada instalação requer uma chave única
- As chaves são vinculadas ao hardware da máquina
- Chaves expiradas precisam ser renovadas
""")
    
    print(f"Pacote criado em: {dist_dir.absolute()}")
    return True

def main():
    """Função principal"""
    print("=== BUILD DO INSTALADOR ENTALHE CNC CAM ===")
    print()
    
    # Verifica se está no diretório correto
    if not os.path.exists("launcher.py"):
        print("Erro: Execute este script no diretório raiz do projeto")
        sys.exit(1)
    
    # Cria arquivo de chaves válidas se não existir
    if not os.path.exists("valid_keys.json"):
        print("Criando arquivo de chaves válidas...")
        with open("valid_keys.json", 'w') as f:
            f.write("{}")
    
    try:
        # 1. Build do Next.js
        if not build_nextjs():
            print("❌ Falha no build do Next.js")
            sys.exit(1)
        
        # 2. Build do executável Python
        if not build_python_exe():
            print("❌ Falha no build do executável Python")
            sys.exit(1)
        
        # 3. Cria pacote do instalador
        if not create_installer_package():
            print("❌ Falha na criação do pacote")
            sys.exit(1)
        
        print()
        print("✅ BUILD CONCLUÍDO COM SUCESSO!")
        print()
        print("Arquivos gerados:")
        print("- installer_package/: Pacote completo para distribuição")
        print("- dist/: Executáveis individuais")
        print()
        print("Para distribuir:")
        print("1. Comprima a pasta 'installer_package'")
        print("2. Gere chaves com LicenseGenerator.exe")
        print("3. Envie o pacote + chave para o cliente")
        
    except KeyboardInterrupt:
        print("\n❌ Build cancelado pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro durante o build: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
