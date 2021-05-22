/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @author Micah Fitch */

import Pipe from '../sink/Pipe'
import { Stream, Sink, Scheduler, Time, Disposable } from '@most/types'

export default class FilterWarp<A> implements Stream<A> {
  readonly p: (a: A) => boolean
  readonly g: (t: Time) => Time
  readonly source: Stream<A>

  constructor(p: (a: A) => boolean, g: (t: Time) => Time, source: Stream<A>) {
    this.p = p
    this.g = g
    this.source = source
  }

  run(sink: Sink<A>, scheduler: Scheduler): Disposable {
    return this.source.run(new FilterWarpSink(this.p, this.g, sink), scheduler)
  }
}

class FilterWarpSink<A> extends Pipe<A, A> implements Sink<A> {
  readonly p: (a: A) => boolean
  readonly g: (t: Time) => Time

  constructor(p: (a: A) => boolean, g: (t: Time) => Time, sink: Sink<A>) {
    super(sink)
    this.p = p
    this.g = g
  }

  event(t: Time, x: A): void {
    const p = this.p
    const g = this.g
    p(x) && this.sink.event(g(t), x)
  }
}
