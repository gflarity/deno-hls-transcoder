// borrowed from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
/**
 * Parse progress line from ffmpeg stderr
 *
 * @param {String} line progress line
 * @return progress object
 * @private
 */
export function parseProgressLine(line: any) {
  let progress: any = {}

  // Remove all spaces after = and trim
  line = line.replace(/=\s+/g, '=').trim()
  let progressParts = line.split(' ')

  // Split every progress part by "=" to get key and value
  for (var i = 0; i < progressParts.length; i++) {
    var progressSplit = progressParts[i].split('=', 2)
    var key = progressSplit[0]
    var value = progressSplit[1]

    // This is not a progress line
    if (typeof value === 'undefined') return null

    progress[key] = value
  }

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
