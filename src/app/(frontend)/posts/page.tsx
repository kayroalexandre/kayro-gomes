import { redirect } from 'next/navigation'

/**
 * Rota `/posts` — blog index.
 *
 * O conteúdo vive em `/posts/page/[pageNumber]` para suportar paginação.
 * Esta página apenas redireciona para a primeira página para que a URL
 * canônica do blog (`/posts` no header/footer) funcione.
 */
export default function PostsIndexPage(): never {
  redirect('/posts/page/1')
}
