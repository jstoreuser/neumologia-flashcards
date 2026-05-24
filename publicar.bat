@echo off
chcp 65001 > nul
title Assistente de Publicação - PACS Console
color 0B

echo ======================================================================
echo   ASSISTENTE DE PUBLICAÇÃO DO CONSOLE PACS RADIOLÓGICO NO GITHUB
echo ======================================================================
echo.
echo IMPORTANTE: Antes de continuar, vá em https://github.com/new e crie
echo um repositório PUBLICO e vazio (ex: "flashcards-pneumo").
echo.
echo ======================================================================
echo.

set /p GH_USER="1. Digite seu nome de usuario do GitHub (ex: jesse): "
set /p GH_REPO="2. Digite o nome exato do repositorio criado (ex: flashcards-pneumo): "

echo.
echo ======================================================================
echo [INFO] Configurando vinculo com o GitHub...
echo ======================================================================

git remote add origin https://github.com/%GH_USER%/%GH_REPO%.git 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Atualizando URL do repositorio remoto existente...
    git remote set-url origin https://github.com/%GH_USER%/%GH_REPO%.git
)

git branch -M main

echo.
echo ======================================================================
echo [INFO] Enviando arquivos para o GitHub...
echo (Se solicitado, uma janela do navegador abrira para voce se autenticar com segurança)
echo ======================================================================
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo   SUCESSO TOTAL! Os arquivos foram enviados para o seu GitHub!
    echo ======================================================================
    echo.
    echo PRÓXIMO PASSO (Super Simples):
    echo 1. Abra o site do seu repositorio: https://github.com/%GH_USER%/%GH_REPO%
    echo 2. Clique em 'Settings' (Configurações) no topo.
    echo 3. No menu esquerdo, clique em 'Pages'.
    echo 4. Em 'Branch', mude de 'None' para 'main' e clique em 'Save'.
    echo 5. Aguarde 30 segundos e seu site estara live para qualquer amigo usar!
    echo.
) else (
    echo.
    echo ======================================================================
    echo   ERRO: Ocorreu uma falha no envio dos arquivos.
    echo ======================================================================
    echo Por favor, verifique se:
    echo - O nome do usuario e repositorio digitados estao corretos.
    echo - Voce criou o repositorio vazio no GitHub antes de rodar o script.
    echo.
)

pause
