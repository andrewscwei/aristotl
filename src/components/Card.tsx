import { PrismicDocument } from '@prismicio/types'
import _ from 'lodash'
import { align, animations, container, media, selectors, utils } from 'promptu'
import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { colors } from '../styles/theme'
import { useLtxt } from '../utils/i18n'
import { getDocs, getMarkup, getText, getTexts } from '../utils/prismic'
import Pixel from './Pixel'

type Props = HTMLAttributes<HTMLElement> & {
  doc: PrismicDocument
  isSummaryEnabled?: boolean
  onActivate?: () => void
}

export default function Card({
  doc,
  isSummaryEnabled = false,
  onActivate,
  ...props
}: Props) {
  const ltxt = useLtxt()
  const abbreviation = getText(doc, 'data.abbreviation')
  const name = getText(doc, 'data.name')
  const summary = getMarkup(doc, 'data.summary')
  const typeDocs = getDocs(doc, 'data.types', 'type')

  const aliases = _.sortBy(getTexts(doc, 'data.aliases', 'name')) || []
  const firstAliases = _.take(aliases, 3) || []
  const remainingAliases = aliases.length - firstAliases.length

  return (
    <StyledRoot {...props} onClick={() => onActivate?.()}>
      <StyledAbbreviation>
        <Pixel alignment='tl' size={4} offset={1} tintColor={`${utils.toRGBAString(colors.white, .1)}`}/>
        <Pixel alignment='tc' size={4} offset={1} tintColor={`${utils.toRGBAString(colors.white, .1)}`}/>
        <Pixel alignment='tr' size={4} offset={1} tintColor={`${utils.toRGBAString(colors.white, .1)}`}/>
        <Pixel alignment='bl' size={4} offset={1} tintColor={`${utils.toRGBAString(colors.white, .1)}`}/>
        <Pixel alignment='bc' size={4} offset={1} tintColor={`${utils.toRGBAString(colors.white, .1)}`}/>
        <Pixel alignment='br' size={4} offset={1} tintColor={`${utils.toRGBAString(colors.white, .1)}`}/>
        <h2>{abbreviation}</h2>
      </StyledAbbreviation>

      <StyledTypes>
        {typeDocs && typeDocs.map((v: any, i) => (
          <StyledType key={`type-${i}`}>
            <Pixel isHollow={v.slug === 'informal-fallacy'}/>
            <span>{ltxt(v.slug)}</span>
          </StyledType>
        ))}
      </StyledTypes>

      {name &&
        <StyledName>{name}</StyledName>
      }

      {!isSummaryEnabled && firstAliases.length > 0 &&
        <StyledAliases><em>{firstAliases.join(', ')}{remainingAliases > 0 ? `, ${ltxt('n-more', { n: remainingAliases })}` : ''}</em></StyledAliases>
      }

      {isSummaryEnabled && summary &&
        <StyledSummary dangerouslySetInnerHTML={{ __html: summary }}/>
      }

      <StyledDivider isSummaryEnabled={isSummaryEnabled}/>
    </StyledRoot>
  )
}

const StyledSummary = styled.div`
  color: ${props => props.theme.colors.grey};
  margin-top: 1rem;
  overflow: hidden;
  padding: 0 1rem;
  width: 100%;

  p {
    line-height: 1.8rem;
    font-size: 1.4rem;
    font-weight: 400;
  }
`

const StyledType = styled.div`
  ${container.fhcl}
  font-size: 1.1rem;
  font-weight: 400;
  height: 2rem;
  margin-bottom: 1rem;
  margin-left: 1rem;
  text-transform: uppercase;

  ${selectors.eblc} {
    margin-right: .4rem;
  }
`

const StyledTypes = styled.div`
  ${container.fhcl}
`

const StyledAbbreviation = styled.div`
  ${container.fvcl}
  background: ${props => utils.toRGBAString(props.theme.colors.white, .04)}};
  border-bottom: 1px solid ${props => utils.toRGBAString(props.theme.colors.white, .1)}};
  border-top: 1px solid ${props => utils.toRGBAString(props.theme.colors.white, .1)}};
  height: 9rem;
  margin-bottom: 1rem;
  overflow: visible;
  padding: 0 1rem;
  width: 100%;

  h2 {
    font-family: 'NovaMono', monospace;
    font-size: 4.2rem;
    font-weight: 400;

    @media ${media.gtw(350)} {
      font-size: 5rem;
    }

    @media ${media.gtw(400)} {
      font-size: 6rem;
    }
  }
`

const StyledAliases = styled.div`
  ${container.fhtl}
  color: ${props => props.theme.colors.grey};
  font-size: 1.2rem;
  font-weight: 400;
  hyphens: auto;
  line-height: 140%;
  margin-top: 1rem;
  padding: 0 1rem;
  width: 100%;

  @media ${media.gtw(660)} {
    font-size: 1.4rem;
  }
`

const StyledName = styled.h1`
  ${container.box}
  color: ${props => props.theme.colors.lightGrey};
  font-size: 1.3rem;
  font-weight: 400;
  hyphens: auto;
  padding: 0 1rem;
  width: 100%;

  @media ${media.gtw(500)} {
    font-size: 1.4rem;
  }
`

const StyledDivider = styled.div<{
  isSummaryEnabled: boolean
}>`
  ${align.bl}
  ${animations.transition(['opacity', 'background'], 200, 'ease-out')}
  background: ${props => props.theme.colors.darkGrey};
  height: .2rem;
  margin: 2rem;
  opacity: 0;
  width: 2rem;

  @media ${media.gtw(540)} {
    opacity: 1;
  }
`

const StyledRoot = styled.button`
  ${container.fvts}
  ${animations.transition(['background', 'color'], 100, 'ease-in-out')}
  background: ${props => props.theme.colors.offBlack};
  height: inherit;
  overflow: hidden;
  padding: 1rem 1rem 1.5rem;
  text-align: left;
  transform: translate3d(0, 0, 0);
  width: 100%;

  > * {
    flex: 0 0 auto;
  }

  ${selectors.hwot} {
    background: ${props => props.theme.colors.black};
    color: ${props => props.theme.colors.white};

    ${StyledDivider} {
      background: ${props => props.theme.colors.white};
    }
  }
`
