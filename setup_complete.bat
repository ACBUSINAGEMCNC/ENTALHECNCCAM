@echo off
echo ========================================
echo CONFIGURACAO COMPLETA - ENTALHE CNC CAM
echo Sistema de Instalacao com Licenca
echo ========================================
echo.

echo 1. Instalando dependencias Python...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias Python
    pause
    exit /b 1
)

echo.
echo 2. Instalando dependencias Node.js...
pnpm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias Node.js
    pause
    exit /b 1
)

echo.
echo 3. Criando chave de teste...
python create_test_key.py

echo.
echo 4. Testando sistema de licenca...
echo (Uma janela de ativacao deve aparecer)
timeout /t 3
python launcher.py

echo.
echo ========================================
echo CONFIGURACAO CONCLUIDA!
echo ========================================
echo.
echo Proximos passos:
echo 1. Para gerar chaves: python generate_license.py
echo 2. Para criar instalador: python build_installer.py
echo 3. Para testar: python launcher.py
echo.
echo Arquivos importantes:
echo - valid_keys.json: Base de chaves validas
echo - INSTALADOR_README.md: Documentacao completa
echo.
pause
