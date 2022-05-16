import { HLSTranscoderOptions } from './types'
import { spawn } from 'child_process'
import DefaultRenditions from './default-renditions'
import fs from 'fs'

export default class Transcoder {
  inputPath: string
  outputPath: string
  options: HLSTranscoderOptions

  constructor(
    inputPath: string,
    outputPath: string,
    options: HLSTranscoderOptions = {}
  ) {
    this.inputPath = inputPath
    this.outputPath = outputPath
    this.options = options
  }

  public async transcode() {
    let commands: Array<string>
    try {
      commands = await this.buildCommands()
    } catch (err) {
      return err
    }

    let masterPlaylist: any
    try {
      masterPlaylist = await this.writePlaylist()
    } catch (err) {
      return err
    }

    const showLogs = this.options.showLogs ? this.options.showLogs : false

    return new Promise((resolve, reject) => {
      const ffmpeg = this.options.ffmpegPath
        ? spawn(this.options.ffmpegPath, commands)
        : spawn('ffmpeg', commands)

      ffmpeg.stdout.on('data', (data: any) => {
        if (showLogs) {
          console.log(data.toString())
        }
      })

      ffmpeg.stderr.on('data', (data: any) => {
        if (showLogs) {
          console.log(data.toString())
        }
      })

      ffmpeg.on('exit', (code: any) => {
        if (showLogs) {
          console.log(`Child exited with code ${code}`)
        }
        if (code === 0) return resolve(masterPlaylist)
      })
    })
  }

  private buildCommands(): Promise<string[]> {
    return new Promise((resolve) => {
      let commands: Array<string> = ['-hide_banner', '-y', '-i', this.inputPath]
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

  private writePlaylist() {
    return new Promise((resolve) => {
      let m3u8Playlist = `#EXTM3U
      #EXT-X-VERSION:3`

      const renditions = this.options.renditions || DefaultRenditions

      for (let i = 0, len = renditions.length; i < len; i++) {
        const r = renditions[i]
        m3u8Playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${r.bv.replace(
          'k',
          '000'
        )},RESOLUTION=${r.width}x${r.height}${r.height}.m3u8`
      }

      const m3u8Path = `${this.outputPath}/index.m3u8`
      fs.writeFileSync(m3u8Path, m3u8Playlist)

      resolve(m3u8Path)
    })
  }
}
