var os = require('os');
var util = require('util');

require('./utils/KalturaConfig');
require('./utils/KalturaLogger');
var kaltura = require('./MediaManager');

var LiveStreamManager = function() {
	this.init();
	this.initConfig();
};
util.inherits(LiveStreamManager, kaltura.MediaManager);

LiveStreamManager.prototype.initConfig = function() {
	var config = KalturaConfig.config.liveStream;
	this.conversionProfileId = config.defaultConversionProfileId;
};

LiveStreamManager.prototype.getCommand = function(scheduleEvent, resource) {
	var cmd = [
	   this.ffmpegPath,
	   "-re -i",
	   '"' + resource.camera.streamUrl + '"',
	   "-t",
	   scheduleEvent.duration
   ];
	
	for(var i = 0; i < resource.outputs.length; i++){
		var output = resource.outputs[i];
		var streamName = output.id + "_1";
		cmd.push("-c:a copy -c:v copy -f flv", '"' + output.primaryBroadcastingUrl + "/" + streamName + '"');
		if(output.secondaryBroadcastingUrl){
			cmd.push("-c:a copy -c:v copy -f flv", '"' + output.secondaryBroadcastingUrl + "/" + streamName + '"');
		}
	}
	
	return cmd.join(" ");
};

LiveStreamManager.prototype.newEntry = function(scheduleEvent) {
	var entry = new kaltura.client.objects.KalturaLiveStreamEntry();
	entry.sourceType = kaltura.client.enums.KalturaSourceType.LIVE_STREAM;
	entry.mediaType = kaltura.client.enums.KalturaMediaType.LIVE_STREAM_FLASH;
	entry.dvrStatus = kaltura.client.enums.KalturaDVRStatus.DISABLED;
	entry.recordStatus = kaltura.client.enums.KalturaRecordStatus.DISABLED;
	entry.name = scheduleEvent.summary;
	entry.conversionProfileId = this.conversionProfileId;
	
	return entry;
};

LiveStreamManager.prototype.addEntry = function(callback, entry) {
	return this.client.liveStream.add(callback, entry);
};

module.exports = LiveStreamManager;
