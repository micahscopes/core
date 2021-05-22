import { describe, it } from 'mocha'
import { eq, assert } from '@briancavalier/assert'

import { assertSame } from './helper/stream-helper'
import { map, warp, tap, constant } from '../src/combinator/transform'
import { now } from '../src/source/now'
import { at } from '../src/source/at'
import { empty, isCanonicalEmpty } from '../src/source/empty'

import { collectEventsFor } from './helper/testEnv'
import { id } from '@most/prelude'


describe('warp', function () {
  it('should satisfy identity', function () {
    // u.map(function(a) { return a; })) ~= u
    const u = at(1, "hi")
    return assertSame(warp(t => t, u), u)
  })

  it('should satisfy composition', function () {
    // u.map(function(x) { return f(g(x)); }) ~= u.map(g).map(f)
    const f = (t: number): number => t*2
    const g = (t: number): number => t*2

    const u = at(1, "hi")

    return assertSame(
      warp(t => f(g(t)), u),
      warp(f, warp(g, u))
    )
  })

  describe('given a canonical empty stream', function () {
    it('should return a canonical empty stream', function () {
      // Fixture setup
      const emptyStream = empty()
      // Exercise system
      const sut = warp(id, emptyStream)
      // Verify outcome
      assert(isCanonicalEmpty(sut))
    })
  })
})
