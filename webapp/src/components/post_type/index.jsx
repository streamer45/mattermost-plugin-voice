import {getConfig} from 'mattermost-redux/selectors/entities/general';

import PostType from './post_type';

const connect = window.ReactRedux.connect;
const bindActionCreators = window.Redux.bindActionCreators;

const mapStateToProps = (state) => {
    return {
        siteURL: getConfig(state).SiteURL,
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PostType);
