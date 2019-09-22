interface Api{
  getLiveUrl():Array<any>;
  refreshRoomData():void;
  getSiteName():string;
  getSiteIcon():string;
}
export default Api;