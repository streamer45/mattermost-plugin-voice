package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"regexp"
	"sync"
	"time"

	"github.com/mattermost/mattermost-server/v5/model"
	"github.com/mattermost/mattermost-server/v5/plugin"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration
}

var re *regexp.Regexp = regexp.MustCompile(`^\/recordings\/([A-Za-z0-9]+)$`)

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("Mattermost-User-Id")
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if r.URL.Path == "/config" {
		config := p.getConfiguration()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(config)
		return
	} else if matches := re.FindStringSubmatch(r.URL.Path); len(matches) == 2 {
		postID := matches[1]
		if len(postID) != 26 {
			http.NotFound(w, r)
			return
		}

		post, err := p.API.GetPost(postID)
		if err != nil || post.DeleteAt > 0 || post.Type != "custom_voice" {
			http.NotFound(w, r)
			return
		}

		if p.API.HasPermissionToChannel(userID, post.ChannelId, model.PERMISSION_READ_CHANNEL) != true {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}

		fileID, ok := post.Props["fileId"].(string)
		if !ok {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		info, err := p.API.GetFileInfo(fileID)
		if err != nil {
			http.NotFound(w, r)
			return
		}

		file, err := p.API.GetFile(fileID)
		if err != nil {
			http.NotFound(w, r)
			return
		}

		if info.MimeType != "" {
			w.Header().Set("Content-Type", info.MimeType)
		}
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Content-Security-Policy", "Frame-ancestors 'none'")

		reader := bytes.NewReader(file)
		secs := int64(info.UpdateAt / 1000)
		ns := int64((info.UpdateAt - (secs * 1000)) * 1000000)
		http.ServeContent(w, r, info.Name, time.Unix(secs, ns), reader)

		return
	}

	http.NotFound(w, r)
	return
}
