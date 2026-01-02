import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Obter pathname atual
  const pathname = request.nextUrl.pathname

  // Tratar rota raiz "/" - permitir acesso (já redireciona para /dashboard no page.tsx)
  if (pathname === '/') {
    return supabaseResponse
  }

  // Definir rotas públicas (que não precisam de autenticação)
  const publicPaths = ['/login', '/register', '/auth/callback']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Se não estiver autenticado e tentar acessar rota protegida, redirecionar para login
  // IMPORTANTE: Fazer redirect ANTES de processar cookies do Supabase
  if (!user && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectedFrom', pathname)
    // Retornar redirect imediatamente - o Supabase gerencia cookies internamente
    return NextResponse.redirect(loginUrl)
  }

  // Se estiver autenticado e tentar acessar login ou register, redirecionar para dashboard
  // IMPORTANTE: Fazer redirect ANTES de processar cookies do Supabase
  if (user && (pathname === '/login' || pathname === '/register')) {
    const dashboardUrl = new URL('/dashboard', request.url)
    // Retornar redirect imediatamente - o Supabase gerencia cookies internamente
    return NextResponse.redirect(dashboardUrl)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
}

