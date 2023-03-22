import {Session} from "./Session";
import {Platform} from "../platform/web/Platform";
import {Reconnector} from "./net/Reconnector";
import {Storage} from "./storage/idb/Storage";
import {HomeServerApi} from "./net/HomeServerApi";
import {RequestScheduler} from "./net/RequestScheduler";
import {MediaRepository} from "./net/MediaRepository";
import {FeatureSet} from "../features";
import type * as OlmNamespace from "@matrix-org/olm";
import {OlmWorker} from "./e2ee/OlmWorker";
type Olm = typeof OlmNamespace;

type Options = {
    platform: Platform,
    features: FeatureSet,
    reconnector: Reconnector,
}

type MakeOptions = {
    storage: Storage,
    olm: Olm | null,
    olmWorker: OlmWorker | null,
    sessionInfo: {
        id: string,
        deviceId: string,
        userId: string,
        homeServer: string,
        accessToken: string,
    },
}

type SessionAndScheduler = {
    session: Session,
    scheduler: RequestScheduler,
}

export class SessionFactory {
    private readonly _platform: Platform;
    private readonly _features: FeatureSet;
    private readonly _reconnector: Reconnector;

    constructor(options: Options) {
        const {platform, features, reconnector} = options;
        this._platform = platform;
        this._features = features;
        this._reconnector = reconnector;
    }

    make(options: MakeOptions): SessionAndScheduler {
        const {sessionInfo, storage, olm, olmWorker} = options;

        const hsApi = new HomeServerApi({
            homeserver: sessionInfo.homeServer,
            accessToken: sessionInfo.accessToken,
            request: this._platform.request,
            reconnector: this._reconnector,
        });

        const scheduler = new RequestScheduler({hsApi, clock: this._platform.clock});

        const mediaRepository = new MediaRepository({
            homeserver: sessionInfo.homeServer,
            platform: this._platform,
        });

        // no need to pass access token to session
        const filteredSessionInfo = {
            id: sessionInfo.id,
            deviceId: sessionInfo.deviceId,
            userId: sessionInfo.userId,
            homeserver: sessionInfo.homeServer,
        };

        const session = new Session({
            platform: this._platform,
            features: this._features,
            storage: storage,
            sessionInfo: filteredSessionInfo,
            hsApi: scheduler.hsApi,
            olm,
            olmWorker,
            mediaRepository,
        });

        return {
            session: session,
            scheduler: scheduler,
        }
    }
}