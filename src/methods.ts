import Transcoder from '.'
import { HLSTranscoderOptions, _HLSTranscoderOptions } from './types'

import DefaultOptions from './default-options'

/**
 * Check what (if any) options the user has supplied, otherwise fallback
 * to default values
 * @param options
 */
export function setOptions(this: any, options?: HLSTranscoderOptions): _HLSTranscoderOptions {
  let _options: any = {}

  _options.allowUpscaling = options?.allowUpscaling ? options.allowUpscaling : DefaultOptions.allowUpscaling
  _options.ffmpegPath = options?.ffmpegPath ? options.ffmpegPath : DefaultOptions.ffmpegPath
  _options.ffprobePath = options?.ffprobePath ? options.ffprobePath : DefaultOptions.ffprobePath
  _options.renditions = options?.renditions ? options.renditions : DefaultOptions.renditions

  return _options
}
