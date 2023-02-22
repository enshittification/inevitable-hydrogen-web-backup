/*
Copyright 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {ViewModel} from "../../ViewModel";
import {TimelineViewModel} from "./timeline/TimelineViewModel";
import {tileClassForEntry as defaultTileClassForEntry} from "./timeline/tiles/index";
import {getAvatarHttpUrl} from "../../avatar";

export class UnknownRoomViewModel extends ViewModel {
    constructor(options) {
        super(options);
        const {roomIdOrAlias, session} = options;
        this._session = session;
        this.roomIdOrAlias = roomIdOrAlias;
        this._error = null;
        this._busy = false;
        this._worldReadable = false; // won't know until load() finishes with isWorldReadableRoom() call
        this._checkingPreviewCapability = false; // won't know until load() finishes with isWorldReadableRoom() call
    }

    get room() {
        return this._room;
    }

    get error() {
        return this._error?.message;
    }

    async join() {
        this._busy = true;
        this.emitChange("busy");
        try {
            const roomId = await this._session.joinRoom(this.roomIdOrAlias);
            // navigate to roomId if we were at the alias
            // so we're subscribed to the right room status
            // and we'll switch to the room view model once
            // the join is synced
            this.navigation.push("room", roomId);
            // keep busy on true while waiting for the join to sync
        } catch (err) {
            this._error = err;
            this._busy = false;
            this.emitChange("error");
        }
    }

    get busy() {
        return this._busy;
    }

    // matrix.org can choose not to return messages for a world_readable room
    // so this getter is used to render the correct view, if it's possible to preview the room right now
    get previewPossible() {
        return this._worldReadable && !! this._room;
    }

    get checkingPreviewCapability() {
        return this._checkingPreviewCapability;
    }

    get kind() {
        return this._worldReadable ? "worldReadableRoom" : "unknown";
    }

    get timelineViewModel() {
        return this._timelineVM;
    }

    avatarUrl(size) {
        return getAvatarHttpUrl(this._room.avatarUrl, size, this.platform, this._room.mediaRepository);
    }

    async load() {
        this._checkingPreviewCapability = true;
        this._worldReadable = await this._session.isWorldReadableRoom(this.roomIdOrAlias);
        this._checkingPreviewCapability = false;

        if (!this._worldReadable) {
            this.emitChange("checkingPreviewCapability");
            return;
        }

        try {
            this._room = await this._session.loadWorldReadableRoom(this.roomIdOrAlias);
            const timeline = await this._room.openTimeline();
            this._tileOptions = this.childOptions({
                roomVM: this,
                timeline,
                tileClassForEntry: defaultTileClassForEntry,
            });
            this._timelineVM = this.track(new TimelineViewModel(this.childOptions({
                tileOptions: this._tileOptions,
                timeline,
            })));
            this.emitChange("timelineViewModel");
        } catch (err) {
            console.error(`room.openTimeline(): ${err.message}:\n${err.stack}`);
            this._timelineError = err;
            this.emitChange("error");
        }
    }

    dispose() {
        super.dispose();
        void this._session.deleteWorldReadableRoomData(this.roomIdOrAlias);
    }
}
