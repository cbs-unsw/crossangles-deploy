import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { Notice } from '../state/Notice';

export interface Props {
  notice: Notice | null,
  onSnackbarClose: () => void,
}

export const NoticeDisplay = ({
  notice,
  onSnackbarClose,
}: Props) => {
  const { message = '', actions = null } = notice || {};
  return (
    <Snackbar
      key={message || 'snackbar'}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={notice !== null}
      onClose={onSnackbarClose}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      autoHideDuration={6000}
      message={(
        <div id="message-id">
          {message}
        </div>
      )}
      action={actions}
    />
  )
}