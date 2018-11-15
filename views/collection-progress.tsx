import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { get, map, filter } from 'lodash'
import fp from 'lodash/fp'
import { withNamespaces, WithNamespaces } from 'react-i18next'
import { compose } from 'redux'
import { Tooltip, Position } from '@blueprintjs/core'
import { getShipImgPath } from 'views/utils/ship-img'
import { APIMstShipgraph, APIMstShip } from 'kcsapi/api_start2/getData/response'

import styled from 'styled-components'

import { SHIP_TYPES } from './constants'

import { uniqueShipIdsSelector, uniqueShipCountSelector, graphSelector } from './selectors'

const Wrapper = styled.div`
  margin-left: 100px;
`

const ShipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const ShipCube = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  height: 50px;
  width: 50px;
  margin: 2px;
  position: relative;
  overflow: hidden;
`

const ShipAvatar = styled.div`
  height: 50px;
  width: 50px;
  position: absolute;
  top: 0px;
  transition: 0.2s;
  background-position-x: -90px;
  background-size: auto 50px;
`

interface OverlayProps {
  disabled: boolean
}

const Overlay = styled.div<OverlayProps>`
  height: 70px;
  width: 70px;
  position: absolute;
  top: -10px;
  left: -10px;
  background: ${props => !props.disabled && 'rgba(0, 0, 0, 0.75)'};
  transition: 0.2s;
  z-index: 1;

  &:hover {
    background: none;
  }
`

interface CollectionProps extends WithNamespaces {
  $ships: { [key: number]: APIMstShip }
  $graph: { [key: number]: APIMstShipgraph }
  ships: number[]
  count: { [key: number]: number }
  ip: string
}

export const CollectionProgress = compose<FunctionComponent>(
  withNamespaces(['resources', 'poi-plugin-ship-info']),
  connect(state => ({
    $ships: get(state, 'const.$ships', {}),
    $graph: graphSelector(state),
    ships: uniqueShipIdsSelector(state),
    count: uniqueShipCountSelector(state),
    ip: get(state, 'info.server.ip', '203.104.209.71'),
  })),
)(({ $ships, $graph, ships, count, ip, t }: CollectionProps) => {
  const typeShips = map(SHIP_TYPES, ({ id }) =>
    filter(ships, (shipId: number) => id.includes(get($ships, [shipId, 'api_stype']))),
  )

  const typeShipsCollected = map(typeShips, shipIds => filter(shipIds, shipId => count[shipId] > 0))

  return (
    <Wrapper>
      {SHIP_TYPES.map(({ id, name }, i) => (
        <div key={name}>
          <h2>
            {t(name)} {typeShipsCollected[i].length}/{typeShips[i].length}
          </h2>
          <ShipGrid className="ship-grid">
            {fp.flow(
              fp.filter((shipId: number) => id.includes(get($ships, [shipId, 'api_stype']))),
              fp.sortBy([
                (shipId: number) => -get($ships, [shipId, 'api_ctype']),
                (shipId: number) => get($graph, [shipId, 'api_sortno']),
              ]),
              fp.map(shipId => (
                // <Tooltip position={Position.TOP} content={t(get($ships, [shipId, 'api_name']))}>
                <ShipCube key={shipId}>
                  <ShipAvatar
                    style={{
                      backgroundImage: `url(${getShipImgPath(
                        shipId,
                        'banner',
                        false,
                        ip,
                        get($graph, [shipId, 'version', 0]),
                      )})`,
                    }}
                  />
                  <Overlay disabled={count[shipId] > 0} />
                </ShipCube>
                // </Tooltip>
              )),
            )(ships)}
          </ShipGrid>
        </div>
      ))}
    </Wrapper>
  )
})
