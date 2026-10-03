import { supabase, hasSupabase } from './supabase.js'

export const auth = $state({
  checked: false,
  user: null,
  error: null,
})

const LOCAL_KEY = 'familia:auth'

export async function initAuth() {
  if (hasSupabase) {
    const { data } = await supabase.auth.getSession()
    auth.user = data.session?.user ?? null
    supabase.auth.onAuthStateChange((_e, session) => {
      auth.user = session?.user ?? null
    })
  } else {
    auth.user = localStorage.getItem(LOCAL_KEY) ? { id: 'local' } : null
  }
  auth.checked = true
}

export async function signIn(email, password) {
  auth.error = null
  if (hasSupabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      auth.error = error.message
      return false
    }
    auth.user = data.user
    return true
  }
  const expected = localStorage.getItem('familia:password') || 'familia'
  if (password === expected) {
    localStorage.setItem(LOCAL_KEY, '1')
    auth.user = { id: 'local' }
    return true
  }
  auth.error = 'Contrasenya incorrecta'
  return false
}

export async function signOut() {
  if (hasSupabase) await supabase.auth.signOut()
  else localStorage.removeItem(LOCAL_KEY)
  auth.user = null
}
