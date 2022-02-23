import parse, { domToReact } from 'html-react-parser'
import _ from 'lodash'
import React, { MouseEvent } from 'react'
import { useDispatch } from 'react-redux'
import { dismissDefinitions, presentDefinitionById } from '../store/definitions'
import { presentFallacyById } from '../store/fallacies'

type Props = {
  markup: string
}

export default function RichText({
  markup,
}: Props) {
  const dispatch = useDispatch()

  const onActivateDefinition = (docId: string) => {
    return (event: MouseEvent) => {
      event.preventDefault()
      dispatch(presentDefinitionById(docId))
    }
  }

  const onActivateFallacy = (docId: string) => {
    return (event: MouseEvent) => {
      event.preventDefault()
      dispatch(dismissDefinitions())
      dispatch(presentFallacyById(docId))
    }
  }

  return (
    <>
      {parse(markup, {
        replace: (node: any) => {
          if (node.name !== 'a' || node.type !== 'tag' || !node.children) return undefined

          const href = _.get(node, 'attribs.href')

          if (!href) return undefined

          if (href.startsWith('/#def-')) {
            const matches = href.match(/\/#def-(.*)/)
            const docId = _.get(matches, '1')

            if (!docId) return undefined

            return (
              <a onClick={onActivateDefinition(docId)}>{domToReact(node.children)}</a>
            )
          }
          else if (href.startsWith('/#')) {
            const matches = href.match(/\/#(.*)/)
            const docId = _.get(matches, '1')
            if (!docId) return undefined

            return (
              <a onClick={onActivateFallacy(docId)}>{domToReact(node.children)}</a>
            )
          }
        },
      })}
    </>
  )
}
