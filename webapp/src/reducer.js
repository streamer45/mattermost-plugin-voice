const combineReducers = window.Redux.combineReducers;

import {
    OPEN_RECORDING_MODAL,
    CLOSE_RECORDING_MODAL,
    START_RECORDING,
    STOP_RECORDING,
    CANCEL_RECORDING,
    UPDATE_RECORDING,
} from './action_types';

const recordingModalVisible = (state = false, action) => {
    switch (action.type) {
    case OPEN_RECORDING_MODAL:
        return true;
    case CLOSE_RECORDING_MODAL:
        return false;
    default:
        return state;
    }
};

const recordingDuration = (state = 0, action) => {
    switch (action.type) {
    case START_RECORDING:
        return 0;
    case STOP_RECORDING:
        return 0;
    case CANCEL_RECORDING:
        return 0;
    case UPDATE_RECORDING:
        return action.duration;
    default:
        return state;
    }
};

export default combineReducers({
    recordingModalVisible,
    recordingDuration,
});
