import * as cp from 'child_process';

export function exec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cp.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error.toString());
      } else if(stderr) {
        reject(stderr.trim());
      } else {
        resolve(stdout.trim());
      }
    });
  })
}