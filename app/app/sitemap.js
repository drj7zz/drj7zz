export default function sitemap() {
  const baseUrl = 'https://giridirghraj.vercel.app';
  const routes = ['', '/about', '/skills', '/career', '/projects', '/blog', '/github', '/connect'];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8
  }));
}
