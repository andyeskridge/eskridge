import type * as react from 'react'
import { CSSProperties } from 'react'

declare module 'react' {
  interface CSSProperties extends CSSProperties {
    /**
     * Add your custom properties here
     */
    position?:
      | 'static'
      | 'relative'
      | 'absolute'
      | 'sticky'
      | 'fixed'
      | 'var(--header-position)'
  }
}
