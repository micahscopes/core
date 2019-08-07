/** @license MIT License (c) copyright 2010-2017 original author or authors */

import { curry2 } from '@most/prelude'
import SettableDisposable from './disposable/SettableDisposable'
import { Stream, Scheduler, Time, Disposable } from '@most/types' // eslint-disable-line no-unused-vars

export interface RunEffects {
  <A>(stream: Stream<A>, scheduler: Scheduler): Promise<void>
  <A>(stream: Stream<A>): (scheduler: Scheduler) => Promise<void>
}

export const runEffects: RunEffects = curry2((stream: Stream<unknown>, scheduler: Scheduler): Promise<void> =>
  new Promise((resolve, reject) =>
    runStream(stream, scheduler, resolve, reject)))

function runStream <A> (stream: Stream<A>, scheduler: Scheduler, resolve: (a: A | undefined) => void, reject: (e: Error) => void) {
  const disposable = new SettableDisposable()
  const observer = new RunEffectsSink(resolve, reject, disposable)

  disposable.setDisposable(stream.run(observer, scheduler))
}

class RunEffectsSink<A> {
  private readonly _disposable: Disposable
  private active: boolean;
  private _error: (e: Error) => void
  private _end: (x: A | undefined) => void

  constructor (end: (x: A | undefined) => void, error: (e: Error) => void, disposable: Disposable) {
    this._end = end
    this._error = error
    this._disposable = disposable
    this.active = true
  }

  event (_t: Time, _x: A): void {}

  end (_t: Time) {
    if (!this.active) {
      return
    }
    this._dispose(this._error, this._end, undefined)
  }

  error (_t: Time, e: Error) {
    this._dispose(this._error, this._error, e)
  }

  _dispose <X> (error: (e: Error) => void, end: (x: X) => void, x: X) {
    this.active = false
    tryDispose(error, end, x, this._disposable)
  }
}

function tryDispose <X> (error: (e: Error) => void, end: (x: X) => void, x: X, disposable: Disposable): void {
  try {
    disposable.dispose()
  } catch (e) {
    error(e)
    return
  }

  end(x)
}
