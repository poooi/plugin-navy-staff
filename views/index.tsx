import React, { Component } from 'react'
import styled from 'styled-components'
import { Alignment, Navbar, NavbarDivider, NavbarGroup, Button } from '@blueprintjs/core'
import { withNamespaces, WithNamespaces } from 'react-i18next'

import { CollectionProgress } from './collection-progress'

const StickyNavbar = styled(Navbar)`
  position: sticky;
  top: 0;
`

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`

class NavyStaff extends Component<WithNamespaces, {}> {
  render() {
    const { t } = this.props

    return (
      <Wrapper>
        <StickyNavbar>
          <NavbarGroup align={Alignment.RIGHT}>
            <NavbarDivider />
            <Button minimal={true}>{t('Planner')}</Button>
            <Button minimal={true}>{t('Stat')}</Button>
            <Button minimal={true}>{t('Collection')}</Button>
          </NavbarGroup>
        </StickyNavbar>
        <CollectionProgress />
      </Wrapper>
    )
  }
}

export const PluginNavyStaff = withNamespaces(['poi-plugin-navy-staff'])(NavyStaff)
