import {SiteJson, StreamJson} from "../Json";

interface Api {
    getLiveUrl(): Array<StreamJson>;

    refreshRoomData(): void;

    getBaseSite():SiteJson;
}

export default Api;