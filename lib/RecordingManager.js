var os = require('os');
var util = require('util');

require('./utils/KalturaConfig');
require('./utils/KalturaLogger');
var kaltura = require('./MediaManager');

var RecordingManager = function() {
	this.init();
};
util.inherits(RecordingManager, kaltura.MediaManager);

RecordingManager.prototype.getCommand = function(camera) {
//	TODO
//	var cmd = [
//	   this.ffmpegPath,
//	   "-re -i",
//	   camera.streamUrl
//   ];
//	
//	for(var i = 0; i < camera.outputs.length; i++){
//		var output = camera.outputs[i];
//		cmd.push("-c:a copy -c:v copy -f flv", output.primaryBroadcastingUrl);
//		if(output.secondaryBroadcastingUrl){
//			cmd.push("-c:a copy -c:v copy -f flv", output.secondaryBroadcastingUrl);
//		}
//	}
	
	return cmd.join(" ");
};

RecordingManager.prototype.newEntry = function(scheduleEvent) {
	var entry = new kaltura.client.objects.KalturaLiveStreamEntry();
	entry.sourceType = kaltura.client.enums.KalturaSourceType.LIVE_STREAM;
	entry.mediaType = kaltura.client.enums.KalturaMediaType.LIVE_STREAM_FLASH;
	entry.name = scheduleEvent.summary;
	return entry;
};

module.exports = RecordingManager;
