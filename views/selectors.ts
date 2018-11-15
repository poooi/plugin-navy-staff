/* tslint:disable no-any */

import { createSelector } from 'reselect'
import _, { mapValues, keyBy, memoize, get, values, Dictionary } from 'lodash'
import fp from 'lodash/fp'
import { APIShip } from 'kcsapi/api_port/port/response'
import { APIMstShipgraph, APIMstShip } from 'kcsapi/api_start2/getData/response'

import {
  constSelector,
  shipsSelector,
  shipDataSelectorFactory,
  fcdSelector,
} from 'views/utils/selectors'

import { SHIP_TYPES_REVERSED } from './constants'

export const graphSelector = createSelector<any, any, Dictionary<APIMstShipgraph>>(
  [constSelector],
  ({ $shipgraph } = {}) => keyBy($shipgraph, 'api_id'),
)

export interface ShipItem {
  id: number
  shipId: number
  typeId: number
  name: string
  lv: number
  area: number
  superTypeIndex: number
  avatarOffset: number
}

export const ShipItemSelectorFactory = memoize(shipId =>
  createSelector<any, any, ShipItem | undefined>(
    [shipDataSelectorFactory(shipId), fcdSelector],
    ([ship, $ship] = [], { shipavatar } = {}) =>
      !!ship && !!$ship
        ? {
            id: ship.api_id,
            shipId: $ship.api_id,
            typeId: $ship.api_stype,
            name: $ship.api_name,
            lv: ship.api_lv,
            area: ship.api_sally_area,
            superTypeIndex: SHIP_TYPES_REVERSED[$ship.api_stype] || 0,
            avatarOffset: get(shipavatar, ['marginMagics', $ship.api_id, 'normal'], 0.555),
          }
        : undefined,
  ),
)

export const shipBaseDataSelector = createSelector(
  [shipsSelector, state => state],
  (ships, state) =>
    fp.flow(
      fp.map((ship: APIShip) => ship.api_id),
      fp.map(shipId => ShipItemSelectorFactory(shipId)(state)),
    )(values(ships)),
)

const ourShipsSelector = createSelector<any, any, { [key: number]: APIMstShip }>(
  [constSelector],
  ({ $ships = {} } = {}) =>
    _($ships)
      .pickBy(({ api_sortno }) => Boolean(api_sortno))
      .value(),
)

const beforeShipMapSelector = createSelector(
  [ourShipsSelector],
  $ships =>
    _($ships)
      .filter(ship => +(ship.api_aftershipid || 0) > 0)
      .map(ship => [ship.api_aftershipid, ship.api_id])
      .fromPairs()
      .value(),
)

// the chain starts from each ship, thus incomplete if the ship is not the starting one
// the adjustedRemodelChainsSelector will return complete chains for all ships
const remodelChainsSelector = createSelector(
  [ourShipsSelector],
  $ships =>
    _($ships)
      .mapValues(({ api_id: shipId }) => {
        let current = $ships[shipId]
        let next = +(current.api_aftershipid || 0)
        let same = [shipId]
        while (!same.includes(next) && next > 0) {
          same = [...same, next]
          current = $ships[next] || {}
          next = +(current.api_aftershipid || 0)
        }
        return same
      })
      .value(),
)

export const uniqueShipIdsSelector = createSelector(
  [ourShipsSelector, beforeShipMapSelector],
  ($ships, beforeShipMap) =>
    _($ships)
      .filter(({ api_id }) => !(api_id in beforeShipMap))
      .map(({ api_id }) => api_id)
      .value(),
)

export const shipUniqueMapSelector = createSelector(
  [uniqueShipIdsSelector, remodelChainsSelector],
  (shipIds, chains) =>
    _(shipIds)
      .flatMap(shipId =>
        _(chains[shipId])
          .map(id => [id, shipId])
          .value(),
      )
      .fromPairs()
      .value(),
)

export const adjustedRemodelChainsSelector = createSelector(
  [remodelChainsSelector, shipUniqueMapSelector],
  (remodelChains, uniqueMap) =>
    _(uniqueMap)
      .mapValues(uniqueId => remodelChains[uniqueId])
      .value(),
)

export const uniqueShipCountSelector = createSelector(
  [uniqueShipIdsSelector, adjustedRemodelChainsSelector, shipBaseDataSelector],
  (uniqs, remodelChains, ships) =>
    mapValues(
      remodelChains,
      shipIds => fp.filter((ship: ShipItem) => shipIds.includes(ship.shipId))(ships).length,
    ),
)
