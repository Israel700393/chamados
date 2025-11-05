@echo off
echo ========================================
echo  INSTALACAO SISTEMA DE CHAMADOS UNISELVA
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [2/4] Preparando dependencias...
if exist package.json (
    echo ✓ package.json ja existe
) else (
    echo Copiando package-api.json para package.json...
    copy package-api.json package.json
)

echo.
echo [3/4] Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha na instalacao das dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas com sucesso

echo.
echo [4/4] Criando estrutura de diretorios...
if not exist data mkdir data
echo ✓ Diretorio data criado

echo.
echo ========================================
echo  INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Para iniciar o sistema:
echo.
echo 1. Iniciar API:     npm start
echo 2. Abrir navegador: sistema-chamados.html
echo.
echo Usuarios padrao:
echo - breno / admin123 (NPD)
echo - felix / npd2024 (NPD)
echo - israel.rangel / israel123 (Usuario)
echo.
echo API estara em: http://localhost:3001
echo.
pause