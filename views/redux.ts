import { combineReducers, Action, Reducer } from 'redux'
import { observer } from 'redux-observers'
import path from 'path'

import { extensionSelectorFactory } from 'views/utils/selectors'

import { fileWriter } from './file-writer'

export const PLUGIN_KEY = 'poi-plugin-navy-staff'
export const DATA_PATH = path.join(window.APPDATA_PATH, `${PLUGIN_KEY}.json`)

/**
 * planner state
 * current: [[ship ids in the area ] for area in fcd ] current deck planner's profile
 * This depends on fcd and ships data and cannot persist
 */

export interface PlannerState {
  current: number[][]
}

export interface State {
  planner: PlannerState
}

const PLANNER_INITIAL_STATE: PlannerState = {
  current: [],
}

interface InitPayload {
  data: State
}

interface PlannerInitPayload {
  mapname: string[]
}

interface PlannerAddOrRemoveShipPayload {
  shipId: number
  areaIndex: number
}

interface PlannerDisplaceShipPayload {
  shipId: number
  fromAreaIndex: number
  toAreaIndex: number
}

interface PlannerAction extends Action<string> {
  payload: InitPayload &
    PlannerInitPayload &
    PlannerAddOrRemoveShipPayload &
    PlannerDisplaceShipPayload
}

export const plannerReducer: Reducer<PlannerState, PlannerAction> = (
  state = PLANNER_INITIAL_STATE,
  action,
) => {
  // const { type, mapname, shipId, areaIndex, fromAreaIndex, toAreaIndex, data } = action
  const { current } = state
  switch (action.type) {
    case `@@${PLUGIN_KEY}@init`: {
      const { data } = action.payload
      return {
        ...state,
        ...data.planner,
      }
    }
    case `@@${PLUGIN_KEY}@dp-init`: {
      const { mapname } = action.payload
      if (current.length < mapname.length) {
        const len = mapname.length - current.length
        return {
          ...state,
          current: [...current, ...new Array(len).fill([])],
        }
      } else if (current.length > mapname.length) {
        const newCurrent = current.slice(0, mapname.length)
        return {
          ...state,
          current: newCurrent,
        }
      }
      break
    }
    case `@@${PLUGIN_KEY}@dp-addShip`: {
      const { shipId, areaIndex } = action.payload
      const newCurrent = current.slice()
      if (!newCurrent[areaIndex].includes(shipId)) {
        newCurrent[areaIndex] = [...newCurrent[areaIndex], shipId]
        return {
          ...state,
          current: newCurrent,
        }
      }
      break
    }
    case `@@${PLUGIN_KEY}@dp-removeship`: {
      const { shipId, areaIndex } = action.payload
      const newCurrent = current.slice()
      if (newCurrent[areaIndex].includes(shipId)) {
        newCurrent[areaIndex] = newCurrent[areaIndex].filter(id => id !== shipId)
        return {
          ...state,
          current: newCurrent,
        }
      }
      break
    }
    case `@@${PLUGIN_KEY}@dp-displaceShip`: {
      const { shipId, fromAreaIndex, toAreaIndex } = action.payload
      const newCurrent = current.slice()
      if (newCurrent[fromAreaIndex].includes(shipId)) {
        newCurrent[fromAreaIndex] = newCurrent[fromAreaIndex].filter(id => id !== shipId)
        newCurrent[toAreaIndex] = [...newCurrent[toAreaIndex], shipId]
        return {
          ...state,
          current: newCurrent,
        }
      }
      break
    }
    default:
      return state
  }
  return state
}

/**
 * ready state, to check if the store is ready for persisting into files
 */

type ReadyState = boolean

const readyReducer: Reducer<ReadyState> = (state = false, action) => {
  const { type } = action
  if (type === `@@${PLUGIN_KEY}@ready`) {
    return true
  }
  return state
}

export interface State {
  planner: PlannerState
  ready: ReadyState
}

export const reducer = combineReducers({
  planner: plannerReducer,
  ready: readyReducer,
})

/* tslint:disable-next-line no-any */
export const dataObserver = observer<any, State>(
  extensionSelectorFactory(PLUGIN_KEY),
  (dispatch, current) => {
    // avoid initial state overwrites file
    if (current.ready) {
      fileWriter.write(DATA_PATH, current)
    }
  },
)
