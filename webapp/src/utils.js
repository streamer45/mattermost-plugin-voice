import {id as pluginId} from 'manifest';

export function getPluginURL() {
    const pluginURL = window.basename ? `${window.basename}/plugins/${pluginId}` :
        `/plugins/${pluginId}`;
    return pluginURL;
}
