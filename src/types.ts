export interface HLSTranscoderOptions {
  allowUpscaling?: boolean
  ffmpegPath?: string
  ffprobePath?: string
  renditions?: Array<RenditionOptions>
}
// Non-optional for _options property
export interface _HLSTranscoderOptions {
  allowUpscaling: boolean
  ffmpegPath: string
  ffprobePath: string
  renditions: Array<RenditionOptions>
}

export interface RenditionOptions {
  width: number
  height: number
  profile: string
  hlsTime: number
  bv: string
  maxrate: string
  bufsize: string
  ba: string
  ts_title: string
  master_title: string
}

export interface VideoMetadata {
  codec_name?: string
  duration?: number
  height?: number
  width?: number
  sample_aspect_ratio?: string
}
