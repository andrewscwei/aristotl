import _ from 'lodash'
import { animations, classes, media, selectors } from 'promptu'
import React, { HTMLAttributes, MouseEvent, forwardRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { getDefinitions, getFallacies } from '../selectors'
import { presentDefinitionByIdAction } from '../store/definitions'
import { dismissFallacyByIdAction, presentFallacyByIdAction } from '../store/fallacies'
import { colors } from '../styles/theme'
import { useLocale, useLtxt } from '../utils/i18n'
import { getDocs, getMarkup, getMarkups, getText, getTexts } from '../utils/prismic'
import ActionButton from './ActionButton'
import Pixel from './Pixel'
import RichText from './RichText'

type Props = HTMLAttributes<HTMLDivElement> & {
  docId?: string
  onPrev?: () => void
  onNext?: () => void
  onExit?: () => void
}

export default forwardRef<HTMLDivElement, Props>(({
  docId,
  onPrev,
  onNext,
  onExit: _onExit,
  ...props
}, ref) => {
  const dispatch = useDispatch()
  const ltxt = useLtxt()
  const locale = useLocale()

  const definitions = useSelector(getDefinitions(locale))
  const fallacies = useSelector(getFallacies(locale))
  const doc = _.find(fallacies, v => v.uid === docId)
  const abbreviation = getText(doc, 'data.abbreviation')
  const name = getText(doc, 'data.name')
  const aliases = _.sortBy(getTexts(doc, 'data.aliases', 'name'))
  const typeDocs = getDocs(doc, 'data.types', 'type', definitions)
  const subtypeDocs = getDocs(doc, 'data.subtypes', 'fallacy', fallacies)
  const inheritanceDocs = getDocs(doc, 'data.inheritance', 'fallacy', fallacies)
  const descriptionMarkup = getMarkup(doc, 'data.description')
  const exampleMarkups = _.sortBy(getMarkups(doc, 'data.examples', 'example'))
  const referenceMarkups = getMarkups(doc, 'data.references', 'reference')
  const relatedDocs = _.sortBy(getDocs(doc, 'data.related', 'fallacy', fallacies), 'data.name')

  const onExit = () => {
    if (_onExit) {
      _onExit()
    }
    else if (docId) {
      dispatch(dismissFallacyByIdAction(docId))
    }
  }

  const onTypeSelect = (docId: string) => (event: MouseEvent) => {
    event.preventDefault()
    dispatch(presentDefinitionByIdAction(docId))
  }

  const onFallacySelect = (docId?: string | null) => (event: MouseEvent) => {
    event.preventDefault()
    if (!docId) return
    dispatch(presentFallacyByIdAction(docId))
  }

  return (
    <StyledRoot {...props}>
      <StyledHeader>
        <StyledCloseButton
          symbol='-'
          tintColor={colors.black}
          onActivate={() => onExit()}
        />
        <div>
          <StyledPrevButton
            symbol='<'
            tintColor={colors.black}
            isDisabled={onPrev === undefined}
            onActivate={() => onPrev?.()}
          />
          <StyledNextButton
            symbol='>'
            tintColor={colors.black}
            isDisabled={onNext === undefined}
            onActivate={() => onNext?.()}
          />
        </div>
      </StyledHeader>

      <StyledBody ref={ref}>
        <StyledAbbreviation>
          <Pixel alignment='tr' tintColor={colors.black}/>
          <Pixel alignment='br' tintColor={colors.black}/>
          <Pixel alignment='cr' tintColor={colors.black}/>
          <Pixel alignment='tc' tintColor={colors.black}/>
          <Pixel alignment='bc' tintColor={colors.black}/>
          <h2>{abbreviation || '--'}</h2>
        </StyledAbbreviation>

        <StyledSection>
          <StyledLabel>{ltxt('name')}</StyledLabel>
          <StyledContent>
            <StyledName>{name || '--'}</StyledName>
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('aliases')}</StyledLabel>
          <StyledContent>
            {!aliases || aliases.length <= 0 ? '--' :
              <ul>
                {aliases.map((v, i) => (
                  <li key={`alias=${i}`}><em>{v}</em></li>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('types')}</StyledLabel>
          <StyledContent>
            {!typeDocs || typeDocs.length <= 0 ? '--' :
              <ul>
                {typeDocs.map((v, i) => (
                  <li key={`type=${i}`}><a onClick={onTypeSelect(v.id)}>{_.get(v, 'data.name')}</a></li>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('inheritance')}</StyledLabel>
          <StyledContent>
            {!inheritanceDocs || inheritanceDocs.length <= 0 ? '--' :
              <ul>
                {inheritanceDocs.map((v, i) => (
                  <li key={`inheritance-${i}`}><a onClick={onFallacySelect(v.uid)}>{_.get(v, 'data.name')}</a></li>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('subtypes')}</StyledLabel>
          <StyledContent>
            {!subtypeDocs || subtypeDocs.length <= 0 ? '--' :
              <ul>
                {subtypeDocs.map((v, i) => (
                  <li key={`subtype-${i}`}><a onClick={onFallacySelect(v.uid)}>{_.get(v, 'data.name')}</a></li>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('description')}</StyledLabel>
          <StyledContent>
            {descriptionMarkup ? <RichText markup={descriptionMarkup}/> : '--'}
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('examples')}</StyledLabel>
          <StyledContent>
            {!exampleMarkups || exampleMarkups.length <= 0 ? '--' :
              <ul>
                {exampleMarkups.map((v, i) => (
                  <li key={`example-${i}`}>
                    <RichText markup={v}/>
                  </li>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('related')}</StyledLabel>
          <StyledContent>
            {!relatedDocs || relatedDocs.length <= 0 ? '--' :
              <ul>
                {relatedDocs.map((v: any, i) => (
                  <li key={`related-${i}`}>
                    <a onClick={() => dispatch(presentFallacyByIdAction(v.uid))}>{_.get(v, 'data.name')}</a>
                  </li>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('references')}</StyledLabel>
          <StyledContent>
            {!referenceMarkups || referenceMarkups.length <= 0 ? '--' :
              <ul>
                {referenceMarkups.map((v, i) => (
                  <li key={`reference-${i}`} dangerouslySetInnerHTML={{ __html: v }}/>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>
      </StyledBody>
    </StyledRoot>
  )
})

const StyledCloseButton = styled(ActionButton)`

`

const StyledPrevButton = styled(ActionButton)<{
  isDisabled: boolean
}>`
  pointer-events: ${props => props.isDisabled ? 'none' : 'auto'};
  opacity: ${props => props.isDisabled ? 0.2 : 1.0};
`

const StyledNextButton = styled(ActionButton)<{
  isDisabled: boolean
}>`
  pointer-events: ${props => props.isDisabled ? 'none' : 'auto'};
  opacity: ${props => props.isDisabled ? 0.2 : 1.0};
`

const StyledContent = styled.div`
  padding: 1rem 1rem;
  width: 100%;
  font-weight: 400;
  font-size: 1.4rem;

  ul,
  ol {
    ${classes.fvtl}
    width: 100%;
    margin: 0;
    padding: 0;

    li {
      list-style: inherit;
      margin-left: 3rem;
      width: calc(100% - 3rem);
    }

    ${selectors.eblc} {
      margin-bottom: .5rem;
    }
  }

  ul {
    list-style: square;

    ul {
      list-style: circle;
    }
  }

  ol {
    list-style: decimal;

    ol {
      list-style: lower-roman;
    }
  }

  p + p,
  p + pre,
  p + ol,
  p + ul,
  pre + p,
  pre + pre,
  pre + ol,
  pre + ul,
  ol + p,
  ol + pre,
  ol + ol,
  ol + ul,
  ul + p,
  ul + pre,
  ul + ul,
  ul + ol {
    margin-top: 1rem;
  }

  pre {
    ${classes.box}
    background: ${props => props.theme.colors.lightGrey};
    line-height: 130%;
    margin: 0;
    padding: 1rem;
    white-space: pre-wrap;
    width: 100%;
    word-wrap: normal;
  }

  a:not([href]) {
    ${animations.transition('color', 200, 'ease-out')}
    color: ${props => props.theme.colors.red};
    cursor: pointer;
    font-weight: 700;

    ${selectors.hwot} {
      color: inherit;
      text-decoration: underline;
    }
  }

  a[href] {
    ${animations.transition('opacity', 200, 'ease-out')}
    color: inherit;
    cursor: pointer;
    font-weight: inherit;
    text-decoration: underline;

    ${selectors.hwot} {
      color: inherit;
      opacity: .6;
    }
  }
`

const StyledLabel = styled.div`
  ${classes.fhcl}
  background: ${props => props.theme.colors.black};
  color: ${props => props.theme.colors.white};
  font-size: 1.4rem;
  font-weight: 400;
  padding: .4rem 1rem;
  text-transform: uppercase;
  width: 100%;
`

const StyledSection = styled.div`
  ${classes.fvtl}
  margin-top: 2rem;
`

const StyledAbbreviation = styled.div`
  ${classes.fhcr}
  background: ${props => props.theme.colors.lightGrey};
  height: 20rem;
  padding: 0 1rem;
  width: 100%;

  h2 {
    color: ${props => props.theme.colors.black};
    font-family: 'NovaMono', monospace;
    width: 100%;
    font-size: 10rem;
    text-align: center;

    @media ${media.gtw(400)} {
      font-size: 12rem;
    }
  }
`

const StyledName = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 120%;
  text-transform: uppercase;
  width: 100%;
`

const StyledHeader = styled.div`
  ${classes.fhcs}
  margin: 3rem 0;
  margin-top: max(3rem, env(safe-area-inset-top));
  padding: 0 1.4rem;
  width: 100%;

  > div {
    ${classes.fhcl}
    ${selectors.eblc} {
      margin-right: 1rem;
    }
  }

  @media ${media.gtmobile} {
    padding: 0 3rem;
  }
`

const StyledBody = styled.div`
  ${classes.box}
  -webkit-overflow-scrolling: touch;
  color: ${props => props.theme.colors.black};
  flex: 1 1 auto;
  overflow-x: hidden;
  overflow-y: scroll;
  padding: 0 1.4rem;
  padding-bottom: env(safe-area-inset-bottom);
  width: 100%;
  user-select: text;

  > *:first-child {
    margin-top: 1rem;
  }

  > *:last-child {
    margin-bottom: 3rem;
  }

  @media ${media.gtmobile} {
    padding: 1rem 3rem 3rem;
    padding-bottom: max(3rem, env(safe-area-inset-bottom));
  }
`

const StyledRoot = styled.div`
  ${classes.fvtl}
  background: ${props => props.theme.colors.white};
  overflow: hidden;
`
