import request from 'superagent';
import {Client4} from 'mattermost-redux/client';

import {id as pluginId} from '../manifest';

import Recorder from './recorder.js';

export default class Client {
    constructor() {
        this._onUpdate = null;
        this.timerID = null;
        this.recorder = new Recorder({
            workerURL: `/plugins/${pluginId}/public/recorder.worker.js`,
        });
        request.get(`/plugins/${pluginId}/config`).accept('application/json').then((res) => {
            this.recorder.init({
                maxDuration: parseInt(res.body.VoiceMaxDuration, 10),
                bitRate: parseInt(res.body.VoiceAudioBitrate, 10),
            }).then(() => {
                // console.log('client: recorder initialized');
            });
        });
        this.channelId = null;
        this.recorder.on('maxduration', () => {
            if (this.timerID) {
                clearInterval(this.timerID);
            }
            this.recorder.stop().then((recording) => {
                this._recording = recording;
                if (this._onUpdate) {
                    this._onUpdate(0);
                }
            });
        });
    }

    startRecording(channelId) {
        if (!channelId) {
            return Promise.reject(new Error('channel id is required'));
        }
        // console.log('client: start recording');
        this._recording = null;
        this.channelId = channelId;
        return this.recorder.start().then(() => {
            this.timerID = setInterval(() => {
                if (this._onUpdate && this.recorder.startTime) {
                    this._onUpdate(new Date().getTime() - this.recorder.startTime);
                }
            }, 200);
        });
    }

    stopRecording() {
        // console.log('client: stop recording');
        if (this.timerID) {
            clearInterval(this.timerID);
        }
        this._onUpdate = null;
        return this.recorder.stop();
    }

    cancelRecording() {
        // console.log('client: cancel recording');
        if (this.timerID) {
            clearInterval(this.timerID);
        }
        this._onUpdate = null;
        return this.recorder.cancel();
    }

    _sendRecording({blob, duration}) {
        const filename = `${new Date().getTime() - duration}.mp3`;
        return request.
            post(Client4.getFilesRoute()).
            set(Client4.getOptions({method: 'post'}).headers).
            attach('files', blob, filename).
            field('channel_id', this.channelId).
            accept('application/json').then((res) => {
                const fileId = res.body.file_infos[0].id;
                return request.post(Client4.getPostsRoute()).
                    set(Client4.getOptions({method: 'post'}).headers).
                    send({
                        channel_id: this.channelId,
                        message: '',
                        type: 'custom_voice',
                        props: {
                            fileId,
                            duration,
                        },
                    }).accept('application/json');
            });
    }

    sendRecording() {
        if (!this.channelId) {
            return Promise.reject(new Error('channel id is required'));
        }
        // console.log('client: send recording');
        if (this._recording) {
            return this._sendRecording(this._recording);
        }
        return this.recorder.stop().then((res) => {
            return this._sendRecording(res);
        });
    }

    on(type, cb) {
        if (type === 'update') {
            this._onUpdate = cb;
        }
    }
}
