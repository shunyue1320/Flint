// spawnSync同步执行子进程： https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options
const { spawnSync } = require("child_process");

function system(cmd, printStdout = true) {
  return spawnSync(cmd, {
    stdio: printStdout ? "inherit" : "pipe", // 子进程的日志打印输出配置 默认inherit传入父进程
    shell: true // 用来执行命令的shell，unix上默认是/bin/sh，windows上默认是cmd.exe
  })
}

function parseStdout({ stdout }) {
  return stdout.toString().trim()
}

// 判断是 windows 还是 mac
if (process.platform === "darwin") {
  // osascript 是执行 mac 的 Applescript 脚本语言的命令
  const existsITerm2 = parseStdout(
    system("osascript ./scripts/launch/mac/exists_iTerm.scpt", false),
  );
  // 判断电脑里有没有 iTerm 这个应用有就使用，没有就使用系统自带的 terminal
  if (existsITerm2 === "true") {
    system("osascript ./scripts/launch/mac/launch_iTerm.scpt");
  } else {
    system("osascript ./scripts/launch/mac/launch_terminal.scpt")
  }
} else if (process.platform === "win32") {
  system("scripts\\launch\\start.cmd")
} else {
  console.log("Please use windows or mac development")
}