/* tslint:disable no-any */
import fs from 'fs-extra'
import { dirname } from 'path'

// A stream of async file writing. `write` queues the task which will be executed
// after all tasks before are done.
// Every instance contains an independent queue.
// Usage:
// var fw = new FileWriter()
// var path = '/path/to/a/file'
// for (var i = 0; i < 100; i++) {
//   fw.write(path, (''+i).repeat(10000))
// }

interface WriteOption {
  encoding?: string | null
  mode?: number | string
  flag?: string
  json?: boolean
}

interface QueueItem {
  path: string
  data: any
  options?: WriteOption
  callback?: () => void
}

class FileWriter {
  writing = false
  private queue: QueueItem[] = []

  write(path: string, data: any, options?: WriteOption, callback?: () => void) {
    this.queue.push({ path, data, options, callback })
    this._continueWriting()
  }

  private _continueWriting() {
    if (this.writing) {
      return
    }
    this.writing = true
    while (this.queue.length) {
      const { path, data, options, callback } = this.queue.shift()!
      fs.ensureDirSync(dirname(path))
      fs.writeFileSync(path, data, options)
      if (callback) {
        callback()
      }
    }
    this.writing = false
  }
}

export const fileWriter = new FileWriter()
