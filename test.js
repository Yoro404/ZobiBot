const { exec } = require('child_process');
exec('ffmpeg -version', (err, stdout) => {
  console.log(err ? 'FFmpeg non trouvé' : 'FFmpeg installé :', stdout);
});