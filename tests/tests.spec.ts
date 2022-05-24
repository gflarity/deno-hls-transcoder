import { test } from '@japa/runner'

import Transcoder  from '../src/index'
import ffmpeg from '@ffmpeg-installer/ffmpeg'
const ffprobe = require('@ffprobe-installer/ffprobe')
import * as fs from 'fs'

import { clearOutputFolder } from './_test.utils'

// What tests to do
// test .mov, .avi, etc
// test that video renditions don't upsample

// Use 1080p version to test default renditions
test.group('Transcode.default', async () => {
  test('transcode default renditions', async ({ assert }) => {
    // Test logic goes here
    const transcoder = new Transcoder(
      `tests/videos/BigBuckBunny1080p30s.mp4`,
      `${__dirname}/output`,
      {
        ffmpegPath: ffmpeg.path,
        ffprobePath: ffprobe.path,
      }
    )

    transcoder.on('error', (err) => {
      console.error(err)
      throw err
    })

    await transcoder.transcode()
    
    assert.equal(fs.existsSync(`${__dirname}/output/index.m3u8`), true)
    assert.equal(fs.existsSync(`${__dirname}/output/1080.m3u8`), true)
    assert.equal(fs.existsSync(`${__dirname}/output/720.m3u8`), true)
    assert.equal(fs.existsSync(`${__dirname}/output/480.m3u8`), true)
    assert.equal(fs.existsSync(`${__dirname}/output/360.m3u8`), true)
  }).setup(async () => {
      await clearOutputFolder()
    })
    .teardown(async () => {
      await clearOutputFolder()
    })
})

//
test.group('Transcode.default', async () => {
  test('transcode vertical video default renditions', async ({ assert }) => {
    // Test logic goes here
    const transcoder = new Transcoder(
      `tests/videos/BigBuckBunny1x1-1080p30s.mp4`,
      `${__dirname}/output`,
      {
        ffmpegPath: ffmpeg.path,
        ffprobePath: ffprobe.path,
      }
    )

    transcoder.on('error', (err) => {
      console.error(err)
      throw err
    })

    await transcoder.transcode()
  
    assert.equal(fs.existsSync(`${__dirname}/output/index.m3u8`), true)
    assert.equal(fs.existsSync(`${__dirname}/output/720.m3u8`), true)
    assert.equal(fs.existsSync(`${__dirname}/output/480.m3u8`), true)
    assert.equal(fs.existsSync(`${__dirname}/output/360.m3u8`), true)
  }).setup(async () => {
      await clearOutputFolder()
    })
    .teardown(async () => {
      await clearOutputFolder()
    })
})
