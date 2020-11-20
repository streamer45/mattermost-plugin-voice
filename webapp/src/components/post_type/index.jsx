import {getPluginURL} from '../../utils.js';

import PostType from './post_type';

const connect = window.ReactRedux.connect;
const bindActionCreators = window.Redux.bindActionCreators;

const mapStateToProps = () => {
    return {
        pluginURL: getPluginURL(),
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PostType);
