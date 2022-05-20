// import Transcoder from '.'
import commandExists from 'command-exists'
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

/**
 * Validates that the supplied ffmpegPath and ffprobePaths exist
 * @param ffmpegPath
 * @param ffprobePath
 * @returns void
 */
export async function validatePaths(this: any, ffmpegPath: string, ffprobePath: string): Promise<void> {
  const ffmpegExists = await commandExists(ffmpegPath).catch(() => {
    return
  })
  const ffprobeExists = await commandExists(ffprobePath).catch(() => {
    return
  })

  return new Promise((resolve) => {
    if (!ffmpegExists && !ffprobeExists) {
      return this.emit('error', new Error('Invalid ffmpeg and ffprobe PATH'))
    }
    if (!ffmpegExists) {
      return this.emit('error', new Error('Invalid ffmpeg PATH'))
    }
    if (!ffprobeExists) {
      return this.emit('error', new Error('Invalid ffprobe PATH'))
    }

    resolve()
  })
}
