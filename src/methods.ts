import Transcoder from ".";
import { HLSTranscoderOptions } from "./types";

import DefaultRenditions from "./default-renditions";

/**
 * Check what (if any) options the user has supplied, otherwise fallback
 * to default values
 * @param options 
 */
function setOptions(this: Transcoder, options?: HLSTranscoderOptions): HLSTranscoderOptions {
  const outputOptions: HLSTranscoderOptions = {}

  outputOptions.allowUpscaling = options?.allowUpscaling ? options.allowUpscaling : false
  outputOptions.ffmpegPath = options?.ffmpegPath ? options.ffmpegPath : 'ffmpeg'
  outputOptions.ffprobePath = options?.ffprobePath ? options.ffprobePath : 'ffprobe'
  outputOptions.renditions = options?.renditions ? options.renditions : DefaultRenditions // TODO import default

  return outputOptions
}