import React, { createContext, useContext, useEffect, useState } from 'react'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '../config/supabase'

WebBrowser.maybeCompleteAuthSession()

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Google config
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  })

  // Check existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadProfile(session.user.id)
      }
      setLoading(false)
    }
    checkSession()
  }, [])

  // Handle Google sign-in response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response
      signInWithGoogle(authentication.accessToken)
    }
  }, [response])

  const signInWithGoogle = async (accessToken) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: accessToken,
        nonce: await generateNonce(), // Implement nonce generation
      })
      if (error) throw error
      await loadProfile(data.user.id)    } catch (err) {
      console.error('Google sign-in error:', err)
      alert('Sign-in failed. Try again.')
    }
  }

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    if (data) {
      setProfile(data)
      setUser({ id: userId, email: data.email })
      
      // Show admin button for app owner
      if (data.email === 'prounknown055@gmail.com') {
        // Trigger admin UI unlock (handled in App.js)
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, 
      signIn: () => promptAsync(), 
      signOut,
      isAdmin: profile?.email === 'prounknown055@gmail.com'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// Helper: Generate nonce for Google auth security
const generateNonce = async () => {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}
