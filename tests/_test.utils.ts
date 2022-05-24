import * as fs from 'fs'
import * as path from 'path'

export async function clearOutputFolder(): Promise<void> {
  // Currently assuming all transcoding is going into output/ dir
  const directory = `${__dirname}/output`
  await fs.readdir(directory, (err, files) => {
    if(err && err.code === 'ENOENT') {
      // No dir to empty, just return
      return
    }
    if (err) throw err;

    for(const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err && err.code === 'ENOENT') {
          // No file to unlink, just return
          return
        }
        if (err) throw err;
      })
    }
  })

  return
}