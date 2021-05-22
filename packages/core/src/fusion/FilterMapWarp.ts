/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @author Micah Fitch */

import Pipe from '../sink/Pipe'
import { Stream, Sink, Scheduler, Time, Disposable } from '@most/types'

export default class FilterMapWarp<A, B> implements Stream<B> {
  readonly p: (a: A) => boolean
  readonly g: (t: Time) => Time
  readonly f: (a: A) => B
  readonly source: Stream<A>

  constructor(p: (a: A) => boolean, f: (x: A) => B, g: (t: Time) => Time, source: Stream<A>) {
    this.p = p
    this.f = f
    this.g = g
    this.source = source
  }

  run(sink: Sink<B>, scheduler: Scheduler): Disposable {
    return this.source.run(new FilterMapWarpSink(this.p, this.f, this.g, sink), scheduler)
  }
}

class FilterMapWarpSink<A, B> extends Pipe<A, B> implements Sink<A> {
  readonly p: (a: A) => boolean
  readonly g: (t: Time) => Time
  readonly f: (x: A) => B

  constructor(p: (a: A) => boolean, f: (x: A) => B, g: (t: Time) => Time, sink: Sink<B>) {
    super(sink)
    this.p = p
    this.f = f
    this.g = g
  }

  event(t: Time, x: A): void {
    const p = this.p
    const f = this.f
    const g = this.g
    p(x) && this.sink.event(g(t), f(x))
  }
}
