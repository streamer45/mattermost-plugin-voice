package main

import (
	"fmt"
	"strings"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-server/model"
	"github.com/mattermost/mattermost-server/plugin"
)

const (
	commandTriggerVoice = "voice"
	commandVoiceHelp    = "Use this command to start recording a voice message."
)

func (p *Plugin) registerCommands() error {
	if err := p.API.RegisterCommand(&model.Command{
		Trigger:          commandTriggerVoice,
		AutoComplete:     true,
		AutoCompleteDesc: "Start recording a voice message",
		DisplayName:      "Start recording a voice message",
	}); err != nil {
		return errors.Wrapf(err, "failed to register %s command", commandTriggerVoice)
	}
	return nil
}

// ExecuteCommand executes a command that has been previously registered via the RegisterCommand
// API.
func (p *Plugin) ExecuteCommand(c *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	trigger := strings.TrimPrefix(strings.Fields(args.Command)[0], "/")

	if trigger == commandTriggerVoice {
		return &model.CommandResponse{}, nil
	}

	return &model.CommandResponse{
		ResponseType: model.COMMAND_RESPONSE_TYPE_EPHEMERAL,
		Text:         fmt.Sprintf("Unknown command: " + args.Command),
	}, nil
}
