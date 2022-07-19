import React from "react"
import { graphql } from "gatsby"

export const query = graphql`
  {
    allBlogPostMarkdown {
      nodes {
        id
        title
        body
      }
    }
  }
`

const HomePage =  ({ data }) => (
  <>
    {data.allBlogPostMarkdown.nodes.map(post => (
      <div key={post.id}>
        <h2>{post.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: post.body }} />
      </div>
    ))}
  </>
)

export default HomePage;
