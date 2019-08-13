import {FormattedMessage} from 'react-intl';

import PostType from './components/post_type';
import Root from './components/root';
import reducer from './reducer';
import {recordVoiceMessage} from './actions';

export default class VoicePlugin {
    initialize(registry, store) {
        registry.registerRootComponent(Root);
        registry.registerFileUploadMethod(
            <i className='icon fa fa-microphone'/>,
            () => {
                recordVoiceMessage()(store.dispatch, store.getState);
            },
            <FormattedMessage
                id='plugin.upload'
                defaultMessage='Voice message'
            />,
        );
        registry.registerPostTypeComponent('custom_voice', PostType);
        registry.registerReducer(reducer);
        registry.registerSlashCommandWillBePostedHook((message, args) => {
            if (message.trim() === '/voice') {
                recordVoiceMessage(args.channel_id, args.root_id)(store.dispatch, store.getState);
                return {};
            }
            return {message, args};
        });
    }
}
