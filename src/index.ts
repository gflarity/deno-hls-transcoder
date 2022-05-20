import { HLSTranscoderOptions, _HLSTranscoderOptions, VideoMetadata } from './types'
import { spawn } from 'child_process'
import DefaultRenditions from './default-renditions'
import fs from 'fs'
import EventEmitter from 'events'
import ffprobe from 'ffprobe'
import commandExists from 'command-exists'

import { setOptions } from './methods'
import { parseProgressStdout } from './utils'

export default class Transcoder extends EventEmitter {
  inputPath: string
  outputPath: string
  options: HLSTranscoderOptions

  private _metadata: VideoMetadata = {}
  private _options: _HLSTranscoderOptions

  constructor(inputPath: string, outputPath: string, options: HLSTranscoderOptions = {}) {
    super()
    this.inputPath = inputPath
    this.outputPath = outputPath
    this.options = options

    this._options = setOptions(this.options)
  }

  public async transcode() {
    await this.validatePaths(this._options.ffmpegPath, this._options.ffprobePath)

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

    // Move this to initializer
    await this.setMetadata()

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
      const renditions = this.options.renditions || DefaultRenditions

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

      const renditions = this.options.renditions || DefaultRenditions

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

  private async setMetadata(): Promise<void> {
    const ffprobePath = this.options.ffprobePath ? this.options.ffprobePath : 'ffprobe'
    let ffprobeData: ffprobe.FFProbeResult
    try {
      ffprobeData = await ffprobe(this.inputPath, { path: ffprobePath })
    } catch (err) {
      throw new Error()
    }
    // const ffprobeData = await ffprobe(this.inputPath, { path: ffprobePath })

    return new Promise((resolve) => {
      if (ffprobeData.streams[0].codec_name) {
        this._metadata.codec_name = ffprobeData.streams[0].codec_name
      }
      if (ffprobeData.streams[0].duration) {
        this._metadata.duration = ffprobeData.streams[0].duration
      }

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
}
