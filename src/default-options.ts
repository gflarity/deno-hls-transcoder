import { _HLSTranscoderOptions } from './types'
import DefaultRenditions from './default-renditions'

const DefaultOptions: _HLSTranscoderOptions = {
  ffmpegPath: 'ffmpeg',
  ffprobePath: 'ffprobe',
  renditions: DefaultRenditions,
  allowUpscaling: false
}

export default DefaultOptions
