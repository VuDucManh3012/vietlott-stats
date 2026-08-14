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

REM ---- Dong bo len GitHub de xem tren dien thoai --------------------------
REM  Chi day du lieu CSV len; GitHub Actions se tu dung lai bao cao va deploy.
REM  Cao du lieu phai chay o day vi vietlott.vn chan IP datacenter cua GitHub.
REM  Loi git khong lam hong ca lan chay: bao cao tren may van dung.
where git >nul 2>nul
if not errorlevel 1 (
  git add data
  git diff --staged --quiet
  if errorlevel 1 (
    echo   Dang dong bo len GitHub...
    git commit -q -m "chore: cap nhat du lieu" && git push -q
    if errorlevel 1 (
      echo   Khong dong bo duoc - ban tren dien thoai se van la ban cu.
    ) else (
      echo   Da dong bo. Sau ~2 phut xem tai: https://vuducmanh3012.github.io/vietlott-stats/
    )
  ) else (
    echo   Khong co ky moi, khong can dong bo.
  )
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
