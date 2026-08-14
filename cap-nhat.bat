@echo off
REM ============================================================
REM  Cap nhat ket qua Vietlott va mo bao cao.
REM  Bam doi vao file nay la xong.
REM
REM  Noi dung file dung tieng Viet KHONG DAU: cmd.exe doc file .bat
REM  theo bang ma he thong, chu co dau se hien thanh ky tu rac.
REM
REM  Tham so /noopen: chi cap nhat, khong mo trinh duyet.
REM ============================================================

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Khong tim thay Node.js tren may.
  echo   Tai tai: https://nodejs.org  roi chay lai file nay.
  echo.
  pause
  exit /b 1
)

echo.
echo   Dang tai ky moi tu vietlott.vn...
echo.

node src/cli.js all
if errorlevel 1 (
  echo.
  echo   CO LOI XAY RA - xem thong bao ben tren.
  echo   Neu loi mang, thu chay lai sau vai phut.
  echo.
  pause
  exit /b 1
)

echo.
echo   Xong. Bao cao: reports\vietlott.html
echo.

if /i not "%~1"=="/noopen" start "" "reports\vietlott.html"

REM Giu cua so vai giay de kip doc so ky moi tai ve.
REM Dung ping thay cho timeout: timeout doi stdin la console, se loi khi chay tu
REM script khac hoac tu Task Scheduler.
ping -n 9 127.0.0.1 >nul 2>nul
exit /b 0
