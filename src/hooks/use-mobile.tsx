import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// Define breakpoints following Odoo & Calendly patterns
export const BREAKPOINTS = {
  SMALL_MOBILE: 480,
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200
}

export type DeviceType = 'smallMobile' | 'mobile' | 'tablet' | 'desktop'

interface ResponsiveContextType {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isSmallMobile: boolean
  deviceType: DeviceType
  windowWidth: number
  windowHeight: number
  prefersReducedMotion: boolean
}

const initialState: ResponsiveContextType = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isSmallMobile: false,
  deviceType: 'desktop',
  windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
  windowHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
  prefersReducedMotion: false
}

const ResponsiveContext = createContext<ResponsiveContextType>(initialState)

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  })
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    const checkReducedMotion = () => {
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
    }
    
    window.addEventListener('resize', handleResize)
    
    // Check for reduced motion preference
    checkReducedMotion()
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionMediaQuery.addEventListener('change', checkReducedMotion)
    
    // Initial call
    handleResize()
    
    return () => {
      window.removeEventListener('resize', handleResize)
      motionMediaQuery.removeEventListener('change', checkReducedMotion)
    }
  }, [])

  const { width, height } = windowDimensions
  const isSmallMobile = width < BREAKPOINTS.SMALL_MOBILE
  const isMobile = width < BREAKPOINTS.MOBILE
  const isTablet = width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.DESKTOP
  const isDesktop = width >= BREAKPOINTS.DESKTOP
  
  // Determine device type based on breakpoints
  let deviceType: DeviceType = 'desktop'
  if (isSmallMobile) deviceType = 'smallMobile'
  else if (isMobile) deviceType = 'mobile'
  else if (isTablet) deviceType = 'tablet'
  
  const value = {
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    deviceType,
    windowWidth: width,
    windowHeight: height,
    prefersReducedMotion
  }
  
  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  )
}

export const useResponsive = () => {
  const context = useContext(ResponsiveContext)
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider')
  }
  return context
}

// Legacy function for backward compatibility
export function useIsMobile() {
  const { isMobile } = useResponsive()
  return isMobile
}
