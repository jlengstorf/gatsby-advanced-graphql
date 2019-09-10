import React from "react"
import { graphql } from "gatsby"

export const query = graphql`
  {
    allBlogPost {
      nodes {
        id
        title
        body
      }
    }
  }
`

export default ({ data }) => (
  <>
    {data.allBlogPost.nodes.map(post => (
      <div key={post.id}>
        <h2>{post.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: post.body }} />
      </div>
    ))}
  </>
)
