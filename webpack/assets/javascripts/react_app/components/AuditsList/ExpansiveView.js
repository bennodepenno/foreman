import React from 'react';
import PropTypes from 'prop-types';
import { renderTemplatesDiff } from '../../../foreman_editor';
import { translate as __ } from '../../common/I18n';

const renderListItems = items =>
  items &&
  items.map((item, index) => (
    (item && typeof item === 'string' && item.length > 0) ? <tr key={index}><td>{item}</td></tr> : null
  ));

const renderCols = changeArr =>
  changeArr &&
  changeArr.map(({ css_class: CssClassStr, id_to_label: idToLabel }, index) => (
    <td key={index} className={changeArr.length > 1 ? `col-6 col-md-4 ${CssClassStr}` : `col-12 col-md-8 ${CssClassStr}`}>
      <div className={CssClassStr}><p>{idToLabel}</p></div>
    </td>
  ));

const renderTableRows = changeEntries => (
  changeEntries &&
  changeEntries.map(({ name, change }, index) => (
    <tr key={index}>
      <td key={index} className='col-6 col-md-4'><div>{ name }</div></td>
      { renderCols(change) }
    </tr>
  )));

const showAuditChanges = (actionDisplayName, auditedChangesWithIdToLabel, details) => {
  const tableClasses = 'table table-bordered table-hover';

  if (['added', 'removed'].includes(actionDisplayName) && details.length > 0) {
    return (
      <table className={`${tableClasses} details-row table-inline-changes ${actionDisplayName === 'added' ? 'show-new' : 'show-old'}`}>
        <tbody>
          { renderListItems(details) }
        </tbody>
      </table>
    );
  }

  if (auditedChangesWithIdToLabel.length > 0) {
    return (
      <table className={ `table-changes ${tableClasses}`}>
        <tbody>
          { renderTableRows(auditedChangesWithIdToLabel) }
        </tbody>
      </table>
    );
  }
  return null;
};

class ExpansiveView extends React.Component {
  constructor(props) {
    super(props);

    this.inputRef = React.createRef();
  }

  componentDidMount() {
    renderTemplatesDiff(this.inputRef.current);
  }

  showTemplateDiffIfAny() {
    const { template } = this.props.auditedChanges;
    if (template && template[0] !== template[1]) {
      const textareaProp = {
        label: __('Template diff'),
        'data-file-name': this.props.auditTitle,
        className: 'col-md-12 editor_source diffMode',
        type: 'text',
      };

      return (
        <div className="editor-section">
          <div className="editor-container">
            <textarea {...textareaProp} />
          </div>
          <input type="hidden" id="old" value={template[0]} />
          <input type="hidden" id="new" value={template[1]} />
        </div>
      );
    }
    return null;
  }

  render() {
    const {
      comment,
      actionDisplayName,
      auditedChangesWithIdToLabel,
      details,
    } = this.props;

    return (
      <div ref={this.inputRef} className="grid-container">
        { this.showTemplateDiffIfAny() }
        { showAuditChanges(actionDisplayName, auditedChangesWithIdToLabel, details) }
        {
          comment &&
            <div className="details-row comment-section">
              <p className='comment-title'><strong>{ __('Comments') }</strong></p>
              <p className='comment-desc'>{ comment }</p>
            </div>
        }
      </div>
    );
  }
}

ExpansiveView.propTypes = {
  auditTitle: PropTypes.string,
  comment: PropTypes.string,
  actionDisplayName: PropTypes.string,
  auditedChanges: PropTypes.object,
  auditedChangesWithIdToLabel: PropTypes.arrayOf(PropTypes.shape({
    change: PropTypes.arrayOf(PropTypes.shape({
      css_class: PropTypes.string,
      id_to_label: PropTypes.string,
    })),
    name: PropTypes.string,
  })),
  details: PropTypes.arrayOf(PropTypes.string),
};

export default ExpansiveView;
