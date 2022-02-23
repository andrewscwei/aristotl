import _ from 'lodash'
import { align, animations, container, selectors } from 'promptu'
import React, { forwardRef, HTMLAttributes, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { getDefinitions } from '../selectors'
import { AppState } from '../store'
import { dismissDefinitionById } from '../store/definitions'
import { colors } from '../styles/theme'
import { getMarkup, getMarkups, getText, getTexts } from '../utils/prismic'
import ActionButton from './ActionButton'
import RichText from './RichText'

type Props = HTMLAttributes<HTMLDivElement> & {
  docId?: string
}

export default forwardRef<HTMLDivElement, Props>(({
  docId,
  ...props
}, ref) => {
  const dispatch = useDispatch()
  const docs = useSelector((state: AppState) => getDefinitions(state))
  const doc = _.find(docs, v => v.id === docId)
  const name = getText(doc, 'data.name')
  const descriptionMarkup = getMarkup(doc, 'data.description')
  const aliases = getTexts(doc, 'data.aliases', 'name')
  const referenceMarkups = getMarkups(doc, 'data.references', 'reference')

  useEffect(() => {
    _.set((ref as any)?.current as any, 'scrollTop', 0)
  }, [docId])

  return (
    <StyledRoot {...props}>
      <StyledCloseButton
        symbol='-'
        tintColor={colors.darkBlue}
        onActivate={() => { if (docId) dispatch(dismissDefinitionById(docId)) }}
      />
      <StyledTitle>{name}</StyledTitle>
      {aliases && <StyledAliases><em>{aliases.join(', ')}</em></StyledAliases>}
      <StyledContent ref={ref}>
        {descriptionMarkup && <RichText markup={descriptionMarkup}/>}
        {(referenceMarkups && referenceMarkups.length > 0) &&
          <>
            <StyledDivider/>
            <ul>
              {referenceMarkups.map((v, i) => (
                <li key={`reference-${i}`} dangerouslySetInnerHTML={{ __html: v }}/>
              ))}
            </ul>
          </>
        }
      </StyledContent>
    </StyledRoot>
  )
})

const StyledCloseButton = styled(ActionButton)`
  ${align.tl}
  margin: 2rem;
`

const StyledAliases = styled.div`
  margin-bottom: 1rem;
  padding: 0 2rem;
  width: 100%;
`

const StyledTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding: 0 2rem;
  text-transform: uppercase;
`

const StyledContent = styled.div`
  -webkit-overflow-scrolling: touch;
  font-size: 1.4rem;
  max-height: 24rem;
  overflow-y: scroll;
  padding: 0 2rem;
  width: 100%;

  ul,
  ol {
    ${container.fvtl}
    width: 100%;
    margin: 0;
    padding: 0;

    li {
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
    ${container.box}
    background: ${props => props.theme.colors.darkPink};
    color: ${props => props.theme.colors.black};
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

const StyledDivider = styled.hr`
  background: ${props => props.theme.colors.darkBlue};
  border: none;
  height: 1px;
  margin: 2rem 0;
  width: 100%;
`

const StyledRoot = styled.div`
  background: ${props => props.theme.colors.pink};
  color: ${props => props.theme.colors.darkBlue};
  font-size: 1.4rem;
  font-weight: 400;
  padding: 6rem 0 3rem;
  user-select: text;
`
