# www.thomaspwilson.com

Personal site: a Vite + React + TypeScript app.

## Running the app

```bash
npm install
npm run dev
```

## Checks

```bash
npm run verify   # lint, typecheck, build, test (also runs in CI and before each deploy)
```

## Deployment

The site is hosted on DreamHost shared hosting (Apache). Every push to
`master`, which in practice means every merged PR, runs
`.github/workflows/deploy.yml`. That workflow:

1. runs `npm run verify` and stops if anything fails
2. uploads `dist/` to the web folder over SSH with `rsync --delete`
3. checks that `/` and `/projects` return 200

You can also start a deploy by hand from the repo's **Actions** tab:
**Deploy** → **Run workflow**.

`public/.htaccess` ships with the build. It sends every unknown path to
`index.html` so links to app pages work when opened directly, and it sets
cache headers.

Files the upload deletes or overwrites are moved to
`~/.deploy-backups/<run id>/` on the server, next to the web folder, rather
than being lost. Clear out old ones there now and then.

### One-time setup

1. **DreamHost:** in the panel, under *Websites → Manage Websites*, set the
   site's user to **SFTP/SSH** access. Note the user name, the server
   host name and the web folder path, for example
   `/home/<user>/thomaspwilson.com`.
2. **Deploy key:** on your machine, create a key used only for deploys:
   ```bash
   ssh-keygen -t ed25519 -N "" -C "github-deploy" -f ~/.ssh/thomaspwilson_deploy
   ```
   Append `~/.ssh/thomaspwilson_deploy.pub` to `~/.ssh/authorized_keys` on
   the DreamHost server.
3. **Host fingerprint:** record the server's host key, then check it against
   what DreamHost shows you:
   ```bash
   ssh-keyscan <dreamhost-host>
   ```
4. **GitHub secrets:** in the repo, go to *Settings → Environments → production*
   (the first deploy run creates it) or *Settings → Secrets and variables →
   Actions*, and add:

   | Secret | Value |
   | --- | --- |
   | `DREAMHOST_SSH_KEY` | contents of `~/.ssh/thomaspwilson_deploy` (the private key) |
   | `DREAMHOST_KNOWN_HOSTS` | output of the `ssh-keyscan` command |
   | `DREAMHOST_HOST` | the server host name |
   | `DREAMHOST_USER` | the SSH user |
   | `DREAMHOST_PATH` | the web folder path |

5. **First deploy:** this replaces the old site in the web folder. Its files
   end up in `~/.deploy-backups/` either way, but taking your own copy first
   is cheap:
   ```bash
   ssh <user>@<dreamhost-host> 'tar czf ~/site-backup-before-react.tgz -C <web-folder> .'
   ```
