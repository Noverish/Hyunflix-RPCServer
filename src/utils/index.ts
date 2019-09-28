export function escapeShellArg (arg) {
  return `'${arg.replace(/'/g, `'\\''`)}'`;
}