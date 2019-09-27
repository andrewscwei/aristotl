import parse, { domToReact } from 'html-react-parser';
import _ from 'lodash';
import React, { MouseEvent, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import { AppState } from '../store';
import { dismissDefinitions, presentDefinitionById } from '../store/definitions';
import { presentFallacyById } from '../store/fallacies';

interface StateProps {

}

interface DispatchProps {
  presentDefinitionById: typeof presentDefinitionById;
  dismissDefinitions: typeof dismissDefinitions;
  presentFallacyById: typeof presentFallacyById;
}

interface Props extends StateProps, DispatchProps {
  markup: string;
}

class RichText extends PureComponent<Props> {
  onActivateDefinition(docId: string) {
    return (event: MouseEvent) => {
      event.preventDefault();
      this.props.presentDefinitionById(docId);
    };
  }

  onActivateFallacy(docId: string) {
    return (event: MouseEvent) => {
      event.preventDefault();
      this.props.dismissDefinitions();
      this.props.presentFallacyById(docId);
    };
  }

  render() {
    return parse(this.props.markup, {
      replace: (node) => {
        if (node.name !== 'a' || node.type !== 'tag' || !node.children) return undefined;

        const href = _.get(node, 'attribs.href');

        if (!href) return undefined;

        if (href.startsWith('#definitions')) {
          const matches = href.match(/#definitions\/(.*)/);
          const docId = _.get(matches, '1');
          if (!docId) return undefined;

          return (
            <a onClick={this.onActivateDefinition(docId)}>{domToReact(node.children)}</a>
          );
        }

        if (href.startsWith('#fallacies')) {
          const matches = href.match(/#fallacies\/(.*)/);
          const docId = _.get(matches, '1');
          if (!docId) return undefined;

          return (
            <a onClick={this.onActivateFallacy(docId)}>{domToReact(node.children)}</a>
          );
        }
      },
    });
  }
}

export default connect(
  (state: AppState): StateProps => ({

  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    presentDefinitionById,
    dismissDefinitions,
    presentFallacyById,
  }, dispatch),
)(RichText);
