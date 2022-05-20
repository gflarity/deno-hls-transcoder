const MultiResRenditions1080 = [
  {
    width: 640,
    height: 360,
    hlsTime: 4,
    master_title: '360p',
    profile: 'main', // profile here?
    renditions: [
      {
        profile: 'main', // or profile here?
        bv: '600k',
        maxrate: '656k',
        bufsize: '1200k',
        ba: '48k',
      },
      {
        profile: 'main',
        bv: '800k',
        maxrate: '856k',
        bufsize: '1200k',
        ba: '96k',
      }
    ]
  },
  {
    width: 720,
    height: 480,
    hlsTime: 4,
    master_title: '360p',
    profile: 'main',
    renditions: [
      {
        profile: 'main',
        bv: '800k',
        maxrate: '856k',
        bufsize: '1200k',
        ba: '96k',
      },
      {    
        profile: 'main',
        bv: '1400k',
        maxrate: '1498k',
        bufsize: '2100k',
        ba: '128k',
      }
    ]
  }
]

export default MultiResRenditions1080