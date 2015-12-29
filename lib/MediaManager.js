var os = require('os');
var child_process = require('child_process');

require('./utils/KalturaConfig');
require('./utils/KalturaLogger');

var kaltura = module.exports = {
	client: require('./client/KalturaClient')
};

if (typeof String.prototype.exec != 'function') {
	String.prototype.exec = function(callback, errorCallback) {
		var cmd = this;
		var childProcess = child_process.exec(cmd, function (error, stdout, stderr) {
			KalturaLogger.log('Command: ' + cmd);
			KalturaLogger.debug('Standard output: ' + stdout);
			
			if(stderr.length){
				KalturaLogger.log('Standard error: ' + stderr);
			}
			
			if (error) {
				if(errorCallback){
					errorCallback(error);
				}
				else{
					var exception = new Error();
					KalturaLogger.error('Exec: ' + error + '\n' + exception.stack);
				}
			}
			else if(callback){
				callback(stdout);
			}
		});

		KalturaLogger.debug('Started cli process [' + childProcess.pid + ']: ' + cmd);
	};
}

var MediaManager = function() {
};

MediaManager.prototype.init = function() {
	this.ffmpegPath = KalturaConfig.config.bin.ffmpegPath;
	this.initClient();
};

MediaManager.prototype.initClient = function(callback) {
	var config = KalturaConfig.config.client;

	KalturaLogger.log('Initializing client');
	this.clientConfig = new kaltura.client.KalturaConfiguration();

	for ( var configKey in config)
		this.clientConfig[configKey] = config[configKey];

	this.clientConfig.setLogger(KalturaLogger);

	var This = this;

	var type = kaltura.client.enums.KalturaSessionType.ADMIN;
	this.sessionReady = false;
	this.client = new kaltura.client.KalturaClient(this.clientConfig);
	this.client.setClientTag('scheduling-server-' + os.hostname());
	var ksTimer = config.expiry;
	if (!ksTimer) {
		ksTimer = 86400 * 1000 - 1000;
	}
	this.client.session.start(function(ks) {
		if (ks) {
			This.client.setKs(ks);
			This.sessionReady = true;

			setTimeout(function() {
				This.initClient(callback);
			}, ksTimer, config, callback);

			if (callback) {
				callback();
			}
		} else {
			KalturaLogger.error('Failed to start client session');
			ksTimer = 2 * 1000;

			setTimeout(function() {
				This.initClient(callback);
			}, ksTimer, config, callback);

			if (callback) {
				callback();
			}
		}

	}, config.secret, config.userId, type, config.partnerId, config.expiry, config.privileges);
};

MediaManager.prototype.getCommand = function(scheduleEvent, resource) {
	return "";
};

MediaManager.prototype.startCamera = function(scheduleEvent, resource) {
	var cmd =this.getCommand(scheduleEvent, resource);
	console.log("Broadcasting to entry [" + resource.outputs[0].id + "]");
	cmd.exec();
};

MediaManager.prototype.startEvent = function(scheduleEvent) {
	for(var i = 0; i < scheduleEvent.resources.length; i++){
		this.startCamera(scheduleEvent, scheduleEvent.resources[i]);
	}
};

MediaManager.prototype.newEntry = function(scheduleEvent) {
	return null;
};

MediaManager.prototype.addEntry = function(callback, entry) {
	return this.client.baseEntry.add(callback, entry);
};

MediaManager.prototype.addResource = function(scheduleEvent, eventResource, entry) {
	var resource = {
		eventResource: eventResource,
		camera: eventResource.relatedObjects.cameras.objects[0],
		outputs: [entry],
	};
	scheduleEvent.resources.push(resource);
	
	var updateEventResource = new kaltura.client.objects.KalturaScheduleEventResource();
	if(eventResource.entryId != entry.id){
		eventResource.entryId = entry.id;
    	updateEventResource.entryId = entry.id;
    	this.client.scheduleEventResource.update(function(response){
    		if (response.objectType == 'KalturaAPIException') {
    			KalturaLogger.error('Client [scheduleEventResource.update][' + response.code + ']: ' + response.message);
    		}
    	}, eventResource.eventId, eventResource.resourceId, updateEventResource);
	}
};

MediaManager.prototype.createEntry = function(scheduleEvent, parentEntryId, callback) {
	var entry = scheduleEvent.entryTemplate;
	if(!entry){
		entry = this.newEntry(scheduleEvent);
	}
	entry.parentEntryId = parentEntryId;
	entry.userId = scheduleEvent.organizerUserId;
	
	var This = this;
	This.addEntry(function(addedEntry) {
		if (addedEntry.objectType == 'KalturaAPIException') {
			KalturaLogger.error('Client [scheduleEventResource.update][' + addedEntry.code + ']: ' + addedEntry.message);
			return;
		}
		
		callback(addedEntry);
		
		if(scheduleEvent.categoriesIds){
    		var categoriesIds = scheduleEvent.categoriesIds.split(",");
    		for(var i = 0; i < categoriesIds.length; i++){
    			var categoryEntry = new kaltura.client.objects.KalturaCategoryEntry();
    			categoryEntry.entryId = addedEntry.id;
    			categoryEntry.categoryId = categoriesIds[i];
    			This.client.categoryEntry.add(function(response){
    				if (response.objectType == 'KalturaAPIException') {
    					KalturaLogger.error('Client [scheduleEventResource.update][' + response.code + ']: ' + response.message);
    				}
    			}, categoryEntry);
    		}
		}
	}, entry);
};

MediaManager.prototype.prepareOutputs = function(scheduleEvent, eventResource, parentEntryId) {
	var This = this;
	if(eventResource.entryId){
		This.client.baseEntry.get(function(entry) {
    		This.addResource(scheduleEvent, eventResource, entry);
		}, eventResource.entryId);
	}
	else {
    	this.createEntry(scheduleEvent, parentEntryId, function(entry){
    		console.log('Child entry: ' + entry.id);
    		KalturaLogger.log('Child entry: ' + entry.id);
    		KalturaLogger.dir(entry);
    		This.addResource(scheduleEvent, eventResource, entry);
    	});
	}
};

MediaManager.prototype.prepareInputs = function(scheduleEvent) {
	var eventResources = scheduleEvent.relatedObjects.eventResources.objects;
	var mainEventResource = eventResources[0];
	
	var This = this;
	var assignCameras = function(mainEntry){
		
		console.log('Main entry: ' + mainEntry.id + ' resources:' + eventResources.length);
		KalturaLogger.log('Main entry: ' + mainEntry.id);
		KalturaLogger.dir(mainEntry);
		
		scheduleEvent.resources = [];
		This.addResource(scheduleEvent, mainEventResource, mainEntry);
		
		for(var i = 1; i < eventResources.length; i++){
			This.prepareOutputs(scheduleEvent, eventResources[i], mainEntry.id);
		}
	}
	
	var entryId = scheduleEvent.entryId;
	if(mainEventResource.entryId){
		entryId = mainEventResource.entryId;
	}
	if(entryId){
		This.client.baseEntry.get(function(mainEntry) {
			if (mainEntry.objectType == 'KalturaAPIException') {
				KalturaLogger.error('Client [scheduleEventResource.update][' + mainEntry.code + ']: ' + mainEntry.message);
				return;
			}
			
			assignCameras(mainEntry);
		}, entryId);
	}
	else {
		this.createEntry(scheduleEvent, null, function(mainEntry){
			assignCameras(mainEntry);
		});
	}
};

MediaManager.prototype.unschedule = function(scheduleEvent) {
	clearTimeout(scheduleEvent.timeout);
};

MediaManager.prototype.schedule = function(scheduleEvent) {
	KalturaLogger.log('Scheduling event: ' + scheduleEvent.id);
	
	var d = new Date();
	var timer = (scheduleEvent.startDate * 1000) - d.getTime();
	
	if(timer > 0){
		var This = this;
		scheduleEvent.timeout = setTimeout(function(){
			This.startEvent(scheduleEvent);
		}, timer);
	}
	
	this.prepareInputs(scheduleEvent);
};

module.exports.MediaManager = MediaManager;
