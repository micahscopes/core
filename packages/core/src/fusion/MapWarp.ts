
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Pipe from '../sink/Pipe'
import { Stream, Sink, Scheduler, Time, Disposable } from '@most/types'

export default class MapWarp<A, B> implements Stream<B> {
  readonly f: (a: A) => B;
  readonly g: (t: Time) => Time;
  readonly source: Stream<A>;

  constructor(f: (a: A) => B, g: (t: Time) => Time, source: Stream<A>) {
    this.f = f
    this.g = g
    this.source = source
  }

  run(sink: Sink<B>, scheduler: Scheduler): Disposable {
    return this.source.run(new MapWarpSink(this.f, this.g, sink), scheduler)
  }
}

class MapWarpSink<A, B> extends Pipe<A, B> implements Sink<A> {
  readonly f: (a: A) => B;
  readonly g: (t: Time) => Time;

  constructor(f: (a: A) => B, g: (t: Time) => Time, sink: Sink<B>) {
    super(sink)
    this.f = f
    this.g = g
  }

  event(t: Time, x: A): void {
    const f = this.f
    const g = this.g
    this.sink.event(g(t), f(x))
  }
}
