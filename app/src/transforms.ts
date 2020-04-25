import { createTransform } from 'redux-persist';
import { HistoryData } from './state/StateHistory';

export const historyTransform = createTransform(
  (inboundState: HistoryData) => {
    return {
      past: [],
      present: inboundState.present,
      future: [],
    };
  },
  (outboundState: HistoryData) => {
    return outboundState;
  },
  { whitelist: ['history'] },
);

export const noticeTransform = createTransform(
  () => null,
  () => null,
  { whitelist: ['notice'] },
);

export default [historyTransform, noticeTransform];
