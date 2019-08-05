# Mattermost Voice Plugin

This plugin adds support for basic voice messaging in Mattermost.

![](https://i.imgur.com/hPZ3GhG.gif)

## Usage

To start sending a voice message you can either use the ```/voice``` slash command or the existing file attachment functionality as shown in the picture above.

## Demo

A demo server running the latest version of this plugin is located [here](https://mm.krad.stream/testing/channels/town-square).  
You can login using the following details:

```
User: demo
Password: password
```

## Building

User ```make dist``` to build this plugin.

## License

[mattermost-plugin-voice](https://github.com/streamer45/mattermost-plugin-voice) is licensed under [MIT](LICENSE)  
[mp3rec-wasm](https://github.com/streamer45/mp3rec-wasm) is licensed under [MIT](LICENSE)  
[LAME](http://lame.sourceforge.net/) is licensed under [LGPL](vendor/lame/COPYING)  
