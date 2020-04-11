import {cancelRecording, sendRecording} from 'actions';
import {isRecordingModalVisible, recordingDuration} from 'selectors';

import Root from './root';

const connect = window.ReactRedux.connect;
const bindActionCreators = window.Redux.bindActionCreators;

const mapStateToProps = (state) => {
    return {
        visible: isRecordingModalVisible(state),
        duration: recordingDuration(state),
        channelId: state.entities.channels.currentChannelId,
        rootId: state.views.rhs.selectedPostId,
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    cancel: cancelRecording,
    send: sendRecording,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Root);
