declare module 'views/utils/ship-img' {
  export const getShipImgPath: (
    shipId: number,
    type: string,
    damaged: boolean,
    ip: string,
    version: number,
  ) => string
}

declare module 'views/utils/selectors' {
  import { Selector } from 'reselect'
  import { APIMstShipgraph, APIMstShip } from 'kcsapi/api_start2/getData/response'
  import { APIShip } from 'kcsapi/api_port/port/response'

  export type Const = {} & {
    $shipgraph?: APIMstShipgraph[]
    $ships: { [key: number]: APIMstShip }
  }

  export const constSelector: Selector<any, Const>
  export const shipsSelector: Selector<any, { [key: number]: APIShip }>
  export const shipDataSelectorFactory: (shipId: number) => Selector<any, [APIShip, APIMstShip]>
  export const fcdSelector: Selector<any, any>
}
