import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import reducer from './reducers';
import storage from 'redux-persist/lib/storage';
import { coursesTransform, coloursTransform } from './state/transforms';

const persistConfig = {
  key: 'root',
  storage,
  transforms: [ coursesTransform, coloursTransform ],
}
const persistedReducer = persistReducer(persistConfig, reducer);
export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);
