import { test } from 'uvu'
import * as assert from 'uvu/assert'

import Scrib from '../index'

const jsonObject = {
  proto: {
    data: {
      events: [] 
    }
  }
}

test('Encode', () => {
  const payload = jsonObject
  const cache = new Scrib('proto', 'events', 'data')

  const cipher = cache.encode(payload)
  const plaintext = cache.decode(0)
})

test.run()
