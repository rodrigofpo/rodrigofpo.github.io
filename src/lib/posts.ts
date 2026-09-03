import { getCollection } from 'astro:content';

type PublishedPostOptions = {
  limit?: number;
  now?: Date;
};

export async function getPublishedPosts({ limit, now = new Date() }: PublishedPostOptions = {}) {
  const posts = (await getCollection('blog', ({ data }) => (
    !data.draft && data.publishedAt.valueOf() <= now.valueOf()
  ))).sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

  return typeof limit === 'number' ? posts.slice(0, limit) : posts;
}
