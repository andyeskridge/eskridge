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
      | 'var(--header-inner-position)'
  }
}

declare global {
  interface NodeRequire {
    /** A special feature supported by webpack's compiler that allows you to get all matching modules starting from some base directory.  */
    context: (
      directory: string,
      useSubdirectories: boolean,
      regExp: RegExp,
    ) => any
  }
}
