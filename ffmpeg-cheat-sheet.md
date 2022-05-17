# FFMPEG Cheat Sheet -

**Working With FFMPEG:**  
FFFMPEG [logs output to stderr](https://stackoverflow.com/questions/2066076/how-do-i-enable-ffmpeg-logging-and-where-can-i-find-the-ffmpeg-log-file) instead of to stdout, so console output needs to be parser from the stderr pipe.

**Flags:**

- `-ar` - set the audio sampling frequency
- `-b:v` - bitrate:video
- `-b:a` - bitrate:audio
- `-bufsize` - [specifies the decoder buffer size, which determines the variability of the output bitrate](https://trac.ffmpeg.org/wiki/Limiting%20the%20output%20bitrate)
- `-c:a` - codec:audio
- `-c:v` - codec:video
- `-crf` - [Constant Rate Factor - H.264, use a sane range between 17-28 (17 being best)](https://trac.ffmpeg.org/wiki/Encode/H.264)
- `-maxrate` - [specifies a maximum tolerance. this is only used in conjunction with bufsize](https://trac.ffmpeg.org/wiki/Limiting%20the%20output%20bitrate)
- `-profile` - [one of high, main, or baseline for h264 profiles](http://blog.mediacoderhq.com/h264-profiles-and-levels/)
- `-sc_threshold` - Scene Change Threshold - 0 disables
