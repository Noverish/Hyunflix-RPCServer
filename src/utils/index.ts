export function escapeShellArg (arg) {
  return `'${arg.replace(/'/g, `'\\''`)}'`;
}

export function dateToString(date: Date) {
  const year = leadingZeros(date.getFullYear(), 4);
  const month = leadingZeros(date.getMonth() + 1, 2);
  const d = leadingZeros(date.getDate(), 2);
  const hour = leadingZeros(date.getHours(), 2);
  const minute = leadingZeros(date.getMinutes(), 2);
  const second = leadingZeros(date.getSeconds(), 2);

  return `${year}-${month}-${d} ${hour}:${minute}:${second}`;
}

function leadingZeros(num: number, digits: number) {
  let zero = '';
  const n = num.toString();
  if (n.length < digits) {
    for (let i = 0; i < digits - n.length; i += 1) {
      zero += '0';
    }
  }
  return zero + n;
}

export function logger(...args: string[]) {
  console.log(`[${dateToString(new Date())}]`, args.join(' '));
}