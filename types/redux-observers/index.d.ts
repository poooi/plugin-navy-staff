declare module 'redux-observers' {
  import { Dispatch } from 'redux'

  export type ObserverCanceller = () => void

  export interface Observer {
    observe: () => ObserverCanceller
  }

  type Selector<S, R> = (state: S) => R
  type Processor<R> = (dispatch: Dispatch, current: R, previous?: R) => void

  export const observer: <S, R>(selector: Selector<S, R>, processor: Processor<R>) => Observer
}
