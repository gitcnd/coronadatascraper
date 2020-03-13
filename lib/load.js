import cheerio from 'cheerio';
import needle from 'needle';

needle.defaults({
  user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
});

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

async function exists(filePath) {
  return await fs.promises.access(filePath, fs.constants.R_OK).then(() => true).catch(() => false);
}

async function readFile(filePath) {
  return await fs.promises.readFile(filePath);
}

async function writeFile(filePath, data) {
  return await fs.promises.writeFile(filePath, data);
}

function hash(url) {
  return crypto.createHash('md5').update(url).digest('hex');
}

/*
  Load the given URL and return a Cheerio object
*/
async function load(url) {
  let urlHash = hash(url);
  let filePath = path.join('cache', `${urlHash}.html`);
  let body;
  if (await exists(filePath)) {
    console.log('✅ Loading data for %s from cache %s', url, urlHash);
    body = await readFile(filePath);
  }
  else {
    console.log('⚠️  Loading data for %s from server', url);
    let response = await needle('get', url);
    body = response.body.toString();
    await writeFile(filePath, body);
  }

  const $ = cheerio.load(body);
  return $;
}

export default load;