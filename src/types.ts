export interface HLSConverterOptions {
  ffmpegPath?: string
  showLogs?: boolean
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