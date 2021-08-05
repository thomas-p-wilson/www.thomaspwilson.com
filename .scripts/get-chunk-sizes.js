const https = require('https')

function fileSize(bytes) {
    const thresh = 1000;

    if (Math.abs(bytes) < 1000) {
        return bytes + ' B';
    }

    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let u = -1;
    const r = 10**0;

    do {
        bytes /= 1000;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= 1000 && u < units.length - 1);


    return bytes.toFixed(0) + ' ' + units[u];
}

const { assets } = require(__dirname + '/../dist/stats.json');

const interests = assets.filter((a) => (a.emitted && (a.name.endsWith('.js') || a.name.endsWith('.css'))));
console.log('Bundle sizes:');
interests.forEach(({ name, size }) => {
    console.log(`  ${name} - ${fileSize(size)}`);
});
const total = interests.reduce((t, i) => (t + i.size), 0);
console.log(`Total: ${fileSize(total)}`);

const {
    GITHUB_STATUS_USER,
    GITHUB_STATUS_TOKEN,
    CIRCLE_PROJECT_USERNAME,
    CIRCLE_PROJECT_REPONAME,
    CIRCLE_SHA1,
    CIRCLE_BUILD_URL,
    CIRCLE_JOB,
} = process.env;

const context = `ci/circleci: ${CIRCLE_JOB} - size`;
const description = `Bundles total ~${fileSize(total)}`;
const state = 'success'; // success|error|failure|pending

// Compose our URL and auth pieces.
const auth = `${GITHUB_STATUS_USER}:${GITHUB_STATUS_TOKEN}`;
// Compose the body.
const body = JSON.stringify({
    state,
    description,
    context,
    target_url: CIRCLE_BUILD_URL,
});

// Post the status
const options = {
  hostname: 'api.github.com',
  port: 443,
  path: `/repos/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/statuses/${CIRCLE_SHA1}`,
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(auth).toString('base64')}`,
    'Content-Type': 'application/json',
    'Content-Length': body.length,
    'User-Agent': 'build-size-diff',
  }
}

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`)

  res.on('data', (d) => {
    process.stdout.write(d)
  });
});

req.on('error', (error) => {
  console.error(error)
});

req.write(body);
req.end();
