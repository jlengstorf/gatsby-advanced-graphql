/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: "content",
      },
    },
    "gatsby-transformer-remark",
    "gatsby-transformer-json",
    "gatsby-transformer-yaml",
  ],
}
