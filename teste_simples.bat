@echo off
echo TESTE DE INSTALACAO - ENTALHE CNC CAM
echo.

echo Verificando instalacao...
echo.

if exist "C:\Program Files\EntalheCNC_CAM\EntalheCNC_CAM.exe" (
    echo OK - Executavel instalado
) else (
    echo ERRO - Executavel NAO encontrado
)

if exist "C:\Program Files\EntalheCNC_CAM\valid_keys.json" (
    echo OK - Arquivo de chaves instalado
) else (
    echo ERRO - Arquivo de chaves NAO encontrado
)

echo.
echo Conteudo da pasta de instalacao:
dir "C:\Program Files\EntalheCNC_CAM"

echo.
echo Chave de licenca disponivel:
echo ENTALHE-55C94-945ED-4C8AE
echo Cliente: artcompany
echo Valida ate: 07/03/2039

echo.
pause
