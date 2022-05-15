@echo off
setlocal
start cmd /c "pnpm --filter flint-web start%1"
start cmd /c "pnpm --filter flint-components start%1"
exit
