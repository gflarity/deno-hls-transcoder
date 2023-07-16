import { _HLSTranscoderOptions } from './types.ts'
import DefaultRenditions from './default-renditions.ts'

const DefaultOptions: _HLSTranscoderOptions = {
  ffmpegPath: 'ffmpeg',
  ffprobePath: 'ffprobe',
  renditions: DefaultRenditions,
  allowUpscaling: false
}

export default DefaultOptions
