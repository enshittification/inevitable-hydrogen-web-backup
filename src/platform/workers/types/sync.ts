import {Request, Response, Event} from "./base";
import {type DecryptionResult} from "../../../matrix/e2ee/DecryptionResult";

//
// Requests/Responses
//

export enum SyncRequestType {
    StartSync = "StartSync",
    AddPendingEvent = "AddPendingEvent",
}

export interface StartSyncRequest extends Request {
    type: SyncRequestType.StartSync;
    data: {
        sessionId: string,
        deviceId: string,
        userId: string,
        homeserver: string,
        accessToken: string,
    }
}
export interface StartSyncResponse extends Response {
    request: StartSyncRequest;
    data: {}
}

export interface AddPendingEventRequest extends Request {
    type: SyncRequestType.AddPendingEvent;
    data: {
        pendingEvent: object, // TODO: Specify structure of this object.
    }
}
export interface AddPendingEventResponse extends Response {
    request: AddPendingEventRequest;
    data: {}
}

//
// Events
//

export enum SyncEvent {
    StatusChanged = "StatusChanged",
    SyncChanges = "SyncChanges",
}

export interface SyncStatusChanged extends Event {
    type: SyncEvent.StatusChanged;
    data: {
        newValue: string,
    }
}

export type SessionChanges = {
    syncInfo: {
        token: string,
        filterId: string,
    },
    hasNewRoomKeys: boolean,
    e2eeAccountChanges?: number,
    deviceMessageDecryptionResults: DecryptionResult[]|null,
}

export interface SyncChanges extends Event {
    type: SyncEvent.SyncChanges;
    data: {
        session: SessionChanges,
    }
}
