const get = require("lodash.get")

exports.createSchemaCustomization = ({ actions, schema }) => {
  const splitProxyString = str =>
    str.split(".").reduceRight((acc, chunk) => {
      return { [chunk]: acc }
    }, true)

  actions.createFieldExtension({
    name: "proxyResolve",
    args: {
      from: { type: "String!" },
    },
    extend: (options, previousFieldConfig) => {
      return {
        resolve: async (source, args, context, info) => {
          await context.nodeModel.prepareNodes(
            info.parentType, // BlogPostMarkdown
            splitProxyString(options.from), // querying for html field
            splitProxyString(options.from), // resolve this field
            [info.parentType.name] // The types to use are these
          )

          const newSource = await context.nodeModel.runQuery({
            type: info.parentType,
            query: { filter: { id: { eq: source.id } } },
            firstOnly: true,
          })

          return get(newSource.__gatsby_resolved, options.from)
        },
      }
    },
  })

  actions.createTypes([
    `
      interface BlogPost @nodeInterface {
        id: ID!
        title: String!
        date: Date @dateformat
        body: String!
      }
    
      type YamlBlogYaml implements Node & BlogPost @dontInfer {
        id: ID!
        title: String!
        date: Date @dateformat
        body: String!
      }

      type MarkdownRemark implements Node @infer {
        frontmatter: MarkdownRemarkFrontmatter!
      }

      type MarkdownRemarkFrontmatter @infer {
        date: Date @dateformat
      }

      type BlogPostMarkdown implements Node & BlogPost @dontInfer @childOf(type: "MarkdownRemark") {
        id: ID!
        title: String! @proxyResolve(from: "parent.frontmatter.title")
        date: Date @dateformat @proxyResolve(from: "parent.frontmatter.date")
        body: String! @proxyResolve(from: "parent.html")
      }
    `,
  ])
}

exports.onCreateNode = ({ node, actions, createNodeId }) => {
  if (node.internal.type !== "MarkdownRemark") {
    return
  }

  actions.createNode({
    id: createNodeId(`BlogPostMarkdown-${node.id}`),
    parent: node.id,
    internal: {
      type: "BlogPostMarkdown",
      contentDigest: node.internal.contentDigest,
    },
  })
}
