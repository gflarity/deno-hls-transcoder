import { VideoMetadata } from "./types.ts"

// borrowed from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
/**
 * Parse progress line from ffmpeg stderr
 *
 * @param {String} line progress line
 * @return progress object
 * @private
 */
export function parseProgressLine(line: any, _metadata: VideoMetadata) {
  const progress: any = {}

  // Remove all spaces after = and trim
  line = line.replace(/=\s+/g, '=').trim()
  const progressParts = line.split(' ')

  // Split every progress part by "=" to get key and value
  for (let i = 0; i < progressParts.length; i++) {
    const progressSplit = progressParts[i].split('=', 2)
    const key = progressSplit[0]
    const value = progressSplit[1]

    // This is not a progress line
    if (typeof value === 'undefined') return null

    progress[key] = value
  }

  const progressSeconds = timemarkToSeconds(progress["time"])
  const durationSeconds = _metadata.duration ? _metadata.duration : 1

  progress["progress_pct"] = ((progressSeconds / durationSeconds) * 100).toFixed(2)

  return progress
}

/**
 * Progress data sent to stdout pipe via `-progress pipe:1` is different than when
 * sent to the stderr command line output with `-progress -`. 
 * @param line 
 * @param _metadata 
 * @returns 
 */
export function parseProgressStdout(line: any, _metadata: VideoMetadata) {
  const progress: any = {}

  // Remove all spaces after = and trim
  line = line.replace(/=\s+/g, '=').trim()
  const progressParts = line.split('\n')

  // Split every progress part by "=" to get key and value
  for (let i = 0; i < progressParts.length; i++) {
    const progressSplit = progressParts[i].split('=', 2)
    const key = progressSplit[0]
    const value = progressSplit[1]

    // This is not a progress line
    if (typeof value === 'undefined') return null

    progress[key] = value
  }

  const progressSeconds = timemarkToSeconds(progress["out_time"])
  const durationSeconds = _metadata.duration ? _metadata.duration : 1

  // Fix for when out_time is greater than duration
  let progressPct = ((progressSeconds / durationSeconds) * 100)
  if(progressPct > 100) {
    progressPct = 100
  }
  progress["progress_pct"] = progressPct.toFixed(2)

  return progress
}

// TODO: implement
// borrowed from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
/**
 * Extract progress data from ffmpeg stderr and emit 'progress' event if appropriate
 *
 * @param {FfmpegCommand} command event emitter
 * @param {String} stderrLine ffmpeg stderr data
 * @private
 */
/*
function extractProgress(command, stderrLine) {
  var progress = parseProgressLine(stderrLine)

  if (progress) {
    // build progress report object
    var ret = {
      frames: parseInt(progress.frame, 10),
      currentFps: parseInt(progress.fps, 10),
      currentKbps: progress.bitrate ? parseFloat(progress.bitrate.replace('kbits/s', '')) : 0,
      targetSize: parseInt(progress.size || progress.Lsize, 10),
      timemark: progress.time
    }

    // calculate percent progress using duration
    if (command._ffprobeData && command._ffprobeData.format && command._ffprobeData.format.duration) {
      var duration = Number(command._ffprobeData.format.duration)
      if (!isNaN(duration)) ret.percent = (utils.timemarkToSeconds(ret.timemark) / duration) * 100
    }
    command.emit('progress', ret)
  }
}
*/

/**
 * Parse error line from ffmpeg stderr
 * @param line
 */
  export function parseErrorLine(line: string) {
    let error: any = {}

    // Remove all spaces
    if (line.includes('[error] ')) {
      return line.replace('[error] ', '')
    }
  }

/**
 * Convert a [[hh:]mm:]ss[.xxx] timemark into seconds
 *
 * @param {String} timemark timemark string
 * @return Number
 * @private
 */
  function timemarkToSeconds(timemark: string) {
  if (typeof timemark === 'number') {
    return timemark;
  }

  if (timemark.indexOf(':') === -1 && timemark.indexOf('.') >= 0) {
    return Number(timemark);
  }

  const parts = timemark.split(':');

  // add seconds
  let secs = Number(parts.pop());

  if (parts.length) {
    // add minutes
    secs += Number(parts.pop()) * 60;
  }

  if (parts.length) {
    // add hours
    secs += Number(parts.pop()) * 3600;
  }

  return secs;
}