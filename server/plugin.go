package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/mattermost/mattermost-server/model"
	"github.com/mattermost/mattermost-server/plugin"
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

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	config := p.getConfiguration()

	if r.URL.Path == "/config" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(config)
		return
	} else if strings.HasPrefix(r.URL.Path, "/recordings/") {

		userID := r.Header.Get("Mattermost-User-Id")

		if userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		_, postID := path.Split(r.URL.Path)

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

		fileID := fmt.Sprintf("%v", post.Props["fileId"])

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
