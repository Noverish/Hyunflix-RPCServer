export type RawProbed = any;

export interface FFProbeCommon {
  duration: number;
  bitrate: number;
  size: number;
}

export interface FFProbeVideo extends FFProbeCommon {
  width: number;
  height: number;
}

export interface FFProbeMusic extends FFProbeCommon {

}
