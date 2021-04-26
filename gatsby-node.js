const fs = require('fs');
const path = require('path');

exports.createPages = async function ({ actions, graphql }) {
  // const { data } = await graphql(`
  //   query {
  //     allMarkdownRemark {
  //       nodes {
  //         fields {
  //           slug
  //         }
  //       }
  //     }
  //   }
  // `)
  // data.allMarkdownRemark.forEach(node => {
  //   const slug = node.fields.slug
  //   actions.createPage({
  //     path: slug,
  //     component: require.resolve(`./src/templates/blog-post.js`),
  //     context: { slug: slug },
  //   })
  // })

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
      const meta = require(path.join(location, 'metadata.json'))
      let component = require.resolve(path.join(__dirname, 'src/components/calculator/StandardCalculatorPage.js'));
      if (fs.existsSync(path.join(location, 'index.js'))) {
        component = require.resolve(location);
      }
      let config;
      if (fs.existsSync(path.join(location, 'calculator.js'))) {
        config = require(path.join(location, 'calculator.js'));
      }
      actions.createPage({
        path: `/calculators/${slug}`,
        component,
        context: {
          meta,
          config,
        }
      })
    })
}