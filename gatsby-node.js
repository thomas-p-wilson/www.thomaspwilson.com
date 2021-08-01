const fs = require('fs');
const path = require('path');

exports.createPages = async function ({ actions, graphql }) {
  const calculatorsDir = path.resolve(__dirname, 'src/calculators');
  fs.readdirSync(calculatorsDir)
    .map((slug) => ({
      slug,
      location: path.join(calculatorsDir, slug)
    }))
    .filter(({ slug, location }) => (
      fs.existsSync(location)
      && fs.lstatSync(location).isDirectory()
      && fs.existsSync(path.join(location, 'metadata.json'))
    ))
    .map(({ slug, location }) => {
      const meta = require(path.join(location, 'metadata.json'));
      actions.createPage({
        path: `/calculators/${slug}`,
        component: require.resolve(path.join(location, 'index.js')),
        context: {
          meta,
        }
      })
    })
}