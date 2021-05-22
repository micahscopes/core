/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @auhor @micahscopes */

import Pipe from '../sink/Pipe'
import Map from './Map'
import Filter from './Filter'
import MapWarp from './MapWarp'
import FilterMap from './FilterMap'
import FilterWarp from './FilterWarp'
import FilterMapWarp from './FilterMapWarp'
import { compose } from '@most/prelude'
import { isCanonicalEmpty, empty } from '../source/empty'
import { Stream, Sink, Scheduler, Time, Disposable } from '@most/types'

export default class Warp<A> implements Stream<A> {
  readonly g: (a: Time) => Time
  readonly source: Stream<A>

  constructor(g: (t: Time) => Time, source: Stream<A>) {
    this.g = g
    this.source = source
  }

  run(sink: Sink<A>, scheduler: Scheduler): Disposable {
    return this.source.run(new WarpSink(this.g, sink), scheduler)
  }

  /**
   * Create a mapped source, fusing adjacent map.map, filter.map,
   * filter.map.map (and all the warps) if possible
   * @param {function(*):*} f mapping function
   * @param {{run:function}} source source to map
   * @returns {Warp|FilterMap|FilterWarp|FilterMapWarp} mapped source, possibly fused
   */
  static create<A>(g: (t: Time) => Time, source: Stream<A>): Stream<A> {
    if (isCanonicalEmpty(source)) {
      return empty()
    }

    if (source instanceof Warp) {
      return new Warp(compose(g, source.g), source.source)
    }

    if (source instanceof Map) {
      return new MapWarp(source.f, g, source.source)
    }

    if (source instanceof Filter) {
      return new FilterWarp(source.p, g, source.source)
    }

    if (source instanceof FilterWarp) {
      return new FilterWarp(source.p, compose(g, source.g), source.source)
    }

    if (source instanceof MapWarp) {
      return new MapWarp(source.f, compose(g, source.g), source.source)
    }

    if (source instanceof FilterMap) {
      return new FilterMapWarp(source.p, source.f, g, source.source)
    }

    if (source instanceof FilterMapWarp) {
      return new FilterMapWarp(source.p, source.f, compose(g, source.g), source.source)
    }

    return new Warp(g, source)
  }
}

class WarpSink<A> extends Pipe<A, A> implements Sink<A> {
  readonly g: (t: Time) => Time

  constructor(g: (t: Time) => Time, sink: Sink<A>) {
    super(sink)
    this.g = g
  }

  event(t: Time, x: A): void {
    const g = this.g
    this.sink.event(g(t), x)
  }
}

// /**
//  * Transform each value in the stream by applying g to each
//  * @param g warping function
//  * @param stream stream to warp
//  * @returns stream containing items time transformed by g
//  */
// export const _warp = <A>(g: (t: Time) => Time, stream: Stream<A>): Stream<A> => Warp.create(g, stream)

// export const warp = curry2(_warp)
