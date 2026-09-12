const fs = require('fs');

const renames = [
  { old: 'src/config/env.ts', new: 'src/config/env.config.ts' },
  { old: 'src/services/coingecko.ts', new: 'src/services/coingecko.service.ts' },
  { old: 'src/services/omniroute.ts', new: 'src/services/ai.service.ts' },
  { old: 'src/bot/telegram.ts', new: 'src/bot/telegram.bot.ts' },
  { old: 'src/repo/db.ts', new: 'src/repo/mongo.repo.ts' },
  { old: 'src/utils/logger.ts', new: 'src/utils/logger.util.ts' },
  { old: 'src/utils/retry.ts', new: 'src/utils/retry.util.ts' }
];

for (const r of renames) {
  if (fs.existsSync(r.old)) fs.renameSync(r.old, r.new);
}

const filesToUpdate = ['src/index.ts', ...renames.map(r => r.new)];

for (const file of filesToUpdate) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/'\.\.\/config\/env'/g, "'../config/env.config'");
    content = content.replace(/'\.\/config\/env'/g, "'./config/env.config'");
    content = content.replace(/'\.\.\/utils\/logger'/g, "'../utils/logger.util'");
    content = content.replace(/'\.\/utils\/logger'/g, "'./utils/logger.util'");
    content = content.replace(/'\.\.\/utils\/retry'/g, "'../utils/retry.util'");
    content = content.replace(/'\.\/utils\/retry'/g, "'./utils/retry.util'");
    content = content.replace(/'\.\.\/repo\/db'/g, "'../repo/mongo.repo'");
    content = content.replace(/'\.\/repo\/db'/g, "'./repo/mongo.repo'");
    content = content.replace(/'\.\/services\/coingecko'/g, "'./services/coingecko.service'");
    content = content.replace(/'\.\/services\/omniroute'/g, "'./services/ai.service'");
    content = content.replace(/'\.\/bot\/telegram'/g, "'./bot/telegram.bot'");
    fs.writeFileSync(file, content);
  }
}
console.log('Renamed files and updated imports.');
