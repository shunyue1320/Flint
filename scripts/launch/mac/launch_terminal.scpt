on run argv
    if not (count of argv) = 0
        set REGION to item 1 of argv
    else
        set REGION to ""
    end if
    tell application "Terminal"
        activate
        set ProjectRoot to "$(dirname $(dirname $(dirname $(dirname " & (POSIX path of (path to me)) & "))))"
        do script "pnpm --filter flint-web start" & REGION
        do script "pnpm --filter flint-components start" & REGION
    end tell
end run
