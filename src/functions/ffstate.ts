import { exec } from '@src/utils';

const NOT_EXIST_ERROR = 'ffmpeg process does not exist';

const getPidList = async () => (await exec('pgrep ffmpeg || true')).match(/\d+/g);
const getProcessState = (pid: string) => exec(`ps -o stat= -p ${pid}`);
const getActivePid = async () => {
  const pids = (await getPidList()) || [];
  const states = await Promise.all(pids.map((pid) => getProcessState(pid)));
  return pids.filter((_, i) => states[i] !== 'Z')[0];
};

export async function ffmpegExist(): Promise<boolean> {
  return !!(await getActivePid());
}

export async function ffmpegState(): Promise<boolean> {
  const pid: string = await getActivePid();

  if (!pid) {
    throw new Error(NOT_EXIST_ERROR);
  }

  const processState: string = await exec(`ps -o stat= -p ${pid}`);

  if (processState === 'Sl') {
    return true;
  }
  if (processState === 'Tl') {
    return false;
  }
  throw new Error(`Unknown process state: '${processState}'`);
}

export async function ffmpegPause(): Promise<void> {
  const pid: string = await getActivePid();

  if (!pid) {
    throw new Error(NOT_EXIST_ERROR);
  }

  if (await ffmpegState()) {
    await exec(`kill -stop ${pid}`);
    return;
  }
  throw new Error('이미 FFmpeg 프로세스가 정지되어 있습니다');
}

export async function ffmpegResume(): Promise<void> {
  const pid: string = await getActivePid();

  if (!pid) {
    throw new Error(NOT_EXIST_ERROR);
  }

  if (!(await ffmpegState())) {
    await exec(`kill -cont ${pid}`);
    return;
  }
  throw new Error('이미 FFmpeg 프로세스가 실행중입니다');
}
