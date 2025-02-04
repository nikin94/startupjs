// HACK: In order for parse-prop-types to work properly, we have to use it
//       before using the PropTypes.
//       See: https://github.com/diegohaz/parse-prop-types/issues/4#issuecomment-403294065
import parsePropTypes from 'parse-prop-types'
import { BASE_URL } from '@env'
import init from 'startupjs/init'
import orm from '../model'
import React, { useMemo } from 'react'
import { Platform } from 'react-native'
import App from 'startupjs/app'
import { $root, observer, useModel, useSession, useDoc } from 'startupjs'

// Frontend micro-services
import * as main from '../main'
import docs from '../docs'

// Init startupjs connection to server and the ORM.
// baseUrl option is required for the native to work - it's used
// to init the websocket connection and axios.
// Initialization must start before doing any subscribes to data.
init({ baseUrl: BASE_URL, orm })

// TODO: Remove in prod
if (Platform.OS === 'web') window.model = $root

// Global initialization logic
function useGlobalInit (session) {
  let $session = useModel('_session')

  // Initialize _session on mobile
  useMemo(() => session && $session.setEach(session), [])

  let [userId] = useSession('userId')
  let [user, $user] = useDoc('users', userId)

  // Create an anonymous user data if it doesn't exist.
  // You would want to remove this logic after adding real authorization.
  if (!user) {
    console.warn('Anonymous user detected. Creating DUMMY user data...')
    throw $user.createAsync()
  }

  useMemo(() => {
    // reference self to '_session.user' for easier access
    $session.ref('user', $user)
  }, [])
}

export default observer(({ session }) => {
  useGlobalInit(session)

  return pug`
    App(apps={main, docs})
  `
})

// HACK. Described above. Prevent tree shaking from removing the parsePropTypes import
;(() => parsePropTypes)()
