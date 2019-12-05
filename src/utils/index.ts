import * as cp from 'child_process';

export function escapeShellArg(arg) {
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

export function exec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cp.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error.stack);
      } else if (stdout) {
        resolve(stdout.trim());
      } else if (stderr) {
        reject(stderr.trim());
      } else {
        resolve('');
      }
    });
  });
}

export function dateToString(date: Date) {
  const year  = date.getFullYear().toString().padStart(4, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day   = date.getDate().toString().padStart(2, '0');
  const hour  = date.getHours().toString().padStart(2, '0');
  const min   = date.getMinutes().toString().padStart(2, '0');
  const sec   = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}
