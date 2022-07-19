const mdResolverPassthrough = (fieldName) => async (source, args, context, info) => {
  const type = info.schema.getType(`MarkdownRemark`)
  const mdNode = context.nodeModel.getNodeById({
    id: source.parent,
  })
  const resolver = type.getFields()[fieldName].resolve
  const result = await resolver(mdNode, args, context, info)
  return result
}

exports.createSchemaCustomization = ({ actions }) => {
  actions.createFieldExtension({
    name: "mdpassthrough",
    args: {
      fieldName: `String!`,
    },
    extend({ fieldName }) {
      return {
        resolve: mdResolverPassthrough(fieldName),
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
        title: String!
        date: Date @dateformat
        body: String! @mdpassthrough(fieldName: "html")
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
    title: node.frontmatter.title,
    date: node.frontmatter.date,
    internal: {
      type: "BlogPostMarkdown",
      contentDigest: node.internal.contentDigest,
    },
  })
}
