@echo off
chcp 65001 >nul
title АКВТ — Админ-панель
cd /d "%~dp0\.."
echo ============================================================
echo   Запуск админ-панели АКВТ...
echo   Адрес: http://localhost:8790/admin/
echo ============================================================
start "" "http://localhost:8790/admin/"
node server.mjs
pause
