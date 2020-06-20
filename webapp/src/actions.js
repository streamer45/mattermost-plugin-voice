import {
    OPEN_RECORDING_MODAL,
    CLOSE_RECORDING_MODAL,
    START_RECORDING,
    STOP_RECORDING,
    CANCEL_RECORDING,
    UPDATE_RECORDING,
} from './action_types';

let Client = null;

const openRecordingModal = () => (dispatch) => {
    dispatch({
        type: OPEN_RECORDING_MODAL,
    });
};

const closeRecordingModal = () => (dispatch) => {
    dispatch({
        type: CLOSE_RECORDING_MODAL,
    });
};

export const cancelRecording = () => (dispatch) => {
    // console.log('cancel recording');
    dispatch({
        type: CANCEL_RECORDING,
    });
    Client.cancelRecording();
    closeRecordingModal()(dispatch);
};

export const sendRecording = (channelId, rootId) => (dispatch) => {
    // console.log('send recording');
    dispatch({
        type: STOP_RECORDING,
    });
    Client.sendRecording(channelId, rootId).then(() => {
        // console.log('DONE');
    });
    closeRecordingModal()(dispatch);
};

export const recordVoiceMessage = (channelId, rootId, client) => (dispatch) => {
    // console.log('recordVoiceMessage');
    openRecordingModal()(dispatch);

    if (client) {
        Client = client;
    }

    client.startRecording(channelId, rootId).then(() => {
        dispatch({
            type: START_RECORDING,
        });
    });
    client.on('update', (duration) => {
        // console.log(duration);
        dispatch({
            type: UPDATE_RECORDING,
            duration,
        });
    });
};
