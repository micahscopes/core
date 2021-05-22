import { describe, it } from 'mocha'
import { eq, assert } from '@briancavalier/assert'

import { assertSame } from './helper/stream-helper'
import { map, warp, tap, constant } from '../src/combinator/transform'
import { now } from '../src/source/now'
import { at } from '../src/source/at'
import { delay } from '../src/combinator/delay'
import { empty, isCanonicalEmpty } from '../src/source/empty'

import { collectEventsFor } from './helper/testEnv'
import { id } from '@most/prelude'

describe('map', function () {
  it('should satisfy identity', function () {
    // u.map(function(a) { return a; })) ~= u
    const u = now(Math.random())
    return assertSame(map(x => x, u), u)
  })

  it('should satisfy composition', function () {
    // u.map(function(x) { return f(g(x)); }) ~= u.map(g).map(f)
    const f = (x: string): string => x + 'f'
    const g = (x: string): string => x + 'g'

    const u = now('e')

    return assertSame(
      map(x => f(g(x)), u),
      map(f, map(g, u))
    )
  })

  describe('given a canonical empty stream', function () {
    it('should return a canonical empty stream', function () {
      // Fixture setup
      const emptyStream = empty()
      // Exercise system
      const sut = map(id, emptyStream)
      // Verify outcome
      assert(isCanonicalEmpty(sut))
    })
  })
})

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

describe('constant', function () {
  it('should satisfy identity', function () {
    // u.constant(x) ~= u.map(function(){return x;})
    const u = now('e')
    const x = 1
    const f = (): number => x
    return assertSame(
      constant(x, u),
      map(f, u)
    )
  })
})

describe('tap', function () {
  it('should not transform stream items', function () {
    const expected = Math.random()
    const s = tap(() => -1, now(expected))

    return collectEventsFor(1, s)
      .then(eq([{ time: 0, value: expected }]))
  })
})
