import { useLayoutEffect, useMemo, useRef } from 'react'

export default function useSyncEffect (fn, inputs) {
  let destroy = useRef()

  const destroyFn = () => {
    if (destroy.current) {
      typeof destroy.current === 'function' && destroy.current()
      destroy.current = undefined
    }
  }

  useMemo(() => {
    destroyFn()
    destroy.current = fn()
  }, inputs)

  // final destroy when component gets unmounted
  useLayoutEffect(() => {
    return destroyFn
  }, [])
}
