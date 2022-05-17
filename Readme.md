# HLS Transcoder

An FFMPEG Wrapper heavily inspired by [simple-hls](https://github.com/techwarriorz/simple-hls), to transcode Multi-bitrate HLS videos.  

## Installation:  
Via npm:
```bash
npm install hls-transcoder
```

### Prerequisites  
#### ffmpeg and ffprobe  
hls-transcoder requires both ffmpeg, and ffprobe. If ffmpeg and ffprobe are installed on your system, and added to `PATH`, hls-transcoder will try invoking each program via `ffmpeg` and `ffprobe` respectively.  

Alternatively, you can use pre-compiled binaries, ie with `@ffmpeg-installer/ffmpeg` and `@ffprobe-installer/ffprobe`, and specify the `ffmpegPath` and `ffprobePath` properties in the `options` object.

___

## Usage:  

### Basic Setup
**Typescript:** 
```ts
import Transcoder from 'hls-transcoder'

async function transcodeVideo() {
  const transcoder = new Transcoder(
    `[input-video.mp4/.mov/.avi/etc]`
    `${__dirname}/output`,
  )

  transcoder.on('error', (err) => {
    console.error(err)
  })

  try {
    const hlsPath = await transcoder.transcode()
    console.log('Successfully Transcoded Video')
  } catch (err) {
    console.log(err)
  }
}

transcodeVideo();
```

***OR***

Use `@ffmpeg-installer/ffmpeg` and `@ffprobe-installer/ffprobe` to use precompiled binaries of ffmpeg and ffprobe without having to install on your system.  

**Typescript:**
```ts
import Transcoder from 'hls-transcoder';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import ffprobe from '@ffprobe-installer/ffprobe';

async function transcodeVideo() {
  const transcoder = new Transcoder(
    `[input-video.mp4/.mov/.avi/etc]`
    `${__dirname}/output`,
    {
      ffmpegPath: ffmpeg.path,
      ffprobePath: ffprobe.path
    }
  )

  transcoder.on('error', (err) => {
    console.error(err)
  })

  try {
    const hlsPath = await transcoder.transcode()
    console.log('Successfully Transcoded Video')
  } catch (err) {
    console.log(err)
  }
}

transcodeVideo();
```

## Documentation:  


### Setting event handlers
The `Transcoder` class extends `EventEmitter` and will emit the foll  

**'progress' - transcoding progress information**
```ts
transcoder.on('progress', (progress) => {
  console.log(progress)
})
```
The progress event is emitted everytime ffmpeg reports progress information. The progress object contains the following keys:  
* `frame`: total processed frame count
* `fps`: framerate at which FFmpeg is currenlty processing
___

## Ongoing TODOS:
* ~~Progress Bar~~
* Add option for outputPath param per Rendition
* Add option for Renditions per Resolution  
* Fix ffmpeg stderr and stdout processing / parsing