import React from 'react';
import ReactDOM from 'react-dom';

const modalRoot = typeof document !== `undefined` ? document.getElementById('portal') : null;

class Modal extends React.Component {
  renderModal() {
    return (
      <>
        <div className="modal fade show" tabIndex="-1" role="dialog" style={{display: 'block'}}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modal title</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={ this.props.onClose }>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                { this.props.children }
              </div>
              <div className="modal-footer">
                { this.props.onSave && (<button type="button" className="btn btn-primary" onClick={ this.props.onSave }>Save</button>) }
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={ this.props.onClose }>Close</button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" />
      </>
    );
  }

  render() {
    return ReactDOM.createPortal(
      this.renderModal(),
      modalRoot
    );
  }
}
export default Modal;
