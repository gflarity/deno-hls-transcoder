import { HLSTranscoderOptions, _HLSTranscoderOptions, VideoMetadata, RenditionOptions } from './types'
import { spawn } from 'child_process'
import fs from 'fs'
import EventEmitter from 'events'
import ffprobe from 'ffprobe'
import commandExists from 'command-exists'

import DefaultRenditions from './default-renditions'
import DefaultOptions from './default-options'

import { parseProgressStdout } from './utils'

export default class Transcoder extends EventEmitter {
  inputPath: string
  outputPath: string
  options: HLSTranscoderOptions

  private _metadata: VideoMetadata = {}
  private _options: _HLSTranscoderOptions
  private _renditions?: Array<RenditionOptions>

  constructor(inputPath: string, outputPath: string, options: HLSTranscoderOptions = {}) {
    super()
    this.inputPath = inputPath
    this.outputPath = outputPath
    this.options = options

    this._options = this.setOptions(this.options)
  }

  public async transcode() {
    await this.validatePaths(this._options.ffmpegPath, this._options.ffprobePath)
    await this.setMetadata(this._options)

    this.generateRenditions()

    let commands: Array<string>
    try {
      commands = await this.buildCommands()
    } catch (err) {
      return err
    }

    let masterPlaylist: string
    try {
      masterPlaylist = await this.writePlaylist()
    } catch (err) {
      return err
    }

    return new Promise((resolve, reject) => {
      const ffmpeg = this.options.ffmpegPath ? spawn(this.options.ffmpegPath, commands) : spawn('ffmpeg', commands)

      /**
       * stdout processing for progress
       */
      ffmpeg.stdout.setEncoding('utf8')
      ffmpeg.stdout.on('data', (data: any) => {
        const progressLine = parseProgressStdout(data, this._metadata)
        if (progressLine) {
          this.emit('progress', progressLine)
        }
      })

      /**
       * stderr processing for all other ffmpeg information
       */
      ffmpeg.stderr.setEncoding('utf8')
      ffmpeg.stderr.on('data', (data: any) => {
        this.emit('stderr', data)
      })
      ffmpeg.stderr.on('error', (err: any) => {
        this.emit('error', err)
      })

      ffmpeg.on('exit', (code: any) => {
        this.emit('end', `FFMPEG exited with code ${code}`)
        if (code === 0) return resolve(masterPlaylist)
      })
    })
  }

  private buildCommands(): Promise<string[]> {
    return new Promise((resolve) => {
      let commands: Array<string> = [
        '-hide_banner',
        '-progress', // TODO make progress optional?
        `-`,
        '-loglevel',
        'repeat+error',
        '-y',
        '-i',
        this.inputPath
      ]
      let renditions
      if(this._renditions) {
        renditions = this._renditions
      } else {
        throw this.emit('error', new Error('Invalid renditions'))
      }

      for (let i = 0, len = renditions.length; i < len; i++) {
        const r = renditions[i]
        commands = commands.concat([
          '-vf',
          `scale=w=${r.width}:h=${r.height}:force_original_aspect_ratio=decrease`,
          '-c:a',
          'aac',
          '-ar',
          '48000',
          '-c:v',
          'h264',
          `-profile:v`,
          r.profile,
          '-crf',
          '20',
          '-sc_threshold',
          '0',
          '-g',
          '48',
          '-hls_time',
          r.hlsTime.toString(),
          '-hls_playlist_type',
          'vod',
          '-b:v',
          r.bv,
          '-maxrate',
          r.maxrate,
          '-bufsize',
          r.bufsize,
          '-b:a',
          r.ba,
          '-hls_segment_filename',
          `${this.outputPath}/${r.ts_title}_%03d.ts`,
          `${this.outputPath}/${r.height}.m3u8`
        ])
      }

      resolve(commands)
    })
  }

  private writePlaylist(): Promise<string> {
    return new Promise((resolve) => {
      let m3u8Playlist = `#EXTM3U\n#EXT-X-VERSION:3\n`

      const renditions = this._renditions
      if(!renditions) {
        throw new Error('Invalid renditions')
      }

      for (let i = 0, len = renditions.length; i < len; i++) {
        const r = renditions[i]
        m3u8Playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${r.bv.replace('k', '000')},RESOLUTION=${r.width}x${r.height}\n`
        m3u8Playlist += `${r.height}.m3u8\n`
      }

      const m3u8Path = `${this.outputPath}/index.m3u8`
      fs.writeFileSync(m3u8Path, m3u8Playlist)

      resolve(m3u8Path)
    })
  }

  /**
   * Check what (if any) options the user has supplied, otherwise fallback
   * to default values
   * @param options
   */
  private setOptions(options?: HLSTranscoderOptions): _HLSTranscoderOptions {
    const _options: any = {}

    _options.allowUpscaling = options?.allowUpscaling ? options.allowUpscaling : DefaultOptions.allowUpscaling
    _options.ffmpegPath = options?.ffmpegPath ? options.ffmpegPath : DefaultOptions.ffmpegPath
    _options.ffprobePath = options?.ffprobePath ? options.ffprobePath : DefaultOptions.ffprobePath
    _options.renditions = options?.renditions ? options.renditions : DefaultOptions.renditions

    return _options
  }

  /**
   * Runs `ffprobe` on the input video file to gather video metadata
   * @param _options 
   * @param inputPath 
   */
  private async setMetadata(this: any, _options: _HLSTranscoderOptions): Promise<void> {
    let ffprobeData: ffprobe.FFProbeResult
    try {
      ffprobeData = await ffprobe(this.inputPath, { path: _options.ffprobePath})
    } catch (err: any) {
      return this.emit('error', new Error(err))
      // throw new Error()
    }
    
    const _metadata: VideoMetadata = {
      codec_name: ffprobeData.streams[0].codec_name,
      duration: ffprobeData.streams[0].duration,
      height: ffprobeData.streams[0].height,
      width: ffprobeData.streams[0].width
    }

    this._metadata = _metadata

    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * Validates that the supplied ffmpegPath and ffprobePaths exist
   * @param ffmpegPath
   * @param ffprobePath
   * @returns void
   */
  private async validatePaths(ffmpegPath: string, ffprobePath: string): Promise<void> {
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

  /**
   * TODO - rewrite description, but this generates a renditions object based off the supplied renditions object
   * and the supplied options, aka upscaling etc.
   */
  private generateRenditions(): void {
    // User renditions will be stored in _options.renditions
    const _renditions: Array<RenditionOptions>  = []

    if(this._options.allowUpscaling) {
      this._renditions = this._options.renditions
      return
    }

    // Calculate number of pixels in video ie width*height
    if(!this._metadata.width || !this._metadata.height) {
      throw this.emit('error', new Error('Invalid metadata height or width'))
    }
    const videoResolution = this._metadata.width * this._metadata.height

    for (let i = 0, len = this._options.renditions.length; i < len; i++) {
      const renditionResolution = this._options.renditions[i].width * this._options.renditions[i].height
      if(renditionResolution <= videoResolution) {
        _renditions.push(this._options.renditions[i])
      }
    }

    this._renditions = _renditions
    return
  }
}
