export interface HLSTranscoderOptions {
  ffmpegPath?: string
  ffprobePath?: string
  renditions?: Array<RenditionOptions>
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
  width?: number
  height?: number
  duration?: number
}