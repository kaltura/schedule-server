var os = require('os');

require('./utils/KalturaConfig');
require('./utils/KalturaLogger');
var LiveStreamManager = require('./LiveStreamManager');
var RecordingManager = require('./RecordingManager');

var kaltura = {
	client: require('./client/KalturaClient')
};

if (typeof Array.prototype.findScheduleEvent != 'function') {
	Array.prototype.findScheduleEvent = function(id) {
		if(!this.length){
			return false;
		}
		if(typeof start === 'undefined'){
			start = 0;
		}
		if(typeof end === 'undefined'){
			end = this.length;
		}
		var pivot = parseInt(start + (end - start) / 2, 10);
		if (this[pivot].id === id) {
			return this[pivot];
		}
		if (end - start <= 1) {
			return false;
		}
		if (array[pivot].id < id) {
			return this.findNextScheduleEvent(id, pivot, end);
		} else {
			return this.findNextScheduleEvent(id, start, pivot);
		}
	};
}

if (typeof Array.prototype.findNextScheduleEvent != 'function') {
	Array.prototype.findNextScheduleEvent = function(id, start, end) {
		if(!this.length){
			return 0;
		}
		if(typeof start === 'undefined'){
			start = 0;
		}
		if(typeof end === 'undefined'){
			end = this.length;
		}
		var pivot = parseInt(start + (end - start) / 2, 10);
		if (end - start <= 1 || this[pivot].id === id) {
			return pivot;
		}
		if (this[pivot].id < id) {
			return this.findNextScheduleEvent(id, pivot, end);
		} else {
			return this.findNextScheduleEvent(id, start, pivot);
		}
	};
}

if (typeof Array.prototype.addScheduleEvent != 'function') {
	Array.prototype.addScheduleEvent = function(scheduleEvent) {
		this.splice(this.findNextScheduleEvent(scheduleEvent.id), 0, scheduleEvent);
	};
}

var SchedulingManager = function() {
	this.liveStreamManager = null;
	this.recordingManager = null;
	this.lastUpdatedAt = null;
	this.responseProfile = null;
	this.scheduleEvents = null;
	this.init();
};

SchedulingManager.prototype.init = function() {
	var This = this;

	this.scheduleEvents = [];
	this.liveStreamManager = new LiveStreamManager();
	this.recordingManager = new RecordingManager();
	
	this.initResponseProfile();

	var This = this;
	this.initClient(function() {
		This.loop();
	});
};

SchedulingManager.prototype.initResponseProfile = function(callback) {
	var camerasFilter = new kaltura.client.objects.KalturaCameraScheduleResourceFilter();
	camerasFilter.statusEqual = kaltura.client.enums.KalturaScheduleResourceStatus.ACTIVE;

	var camerasMapping = new kaltura.client.objects.KalturaResponseProfileMapping();
	camerasMapping.parentProperty = "resourceId";
	camerasMapping.filterProperty = "idEqual";

	var camerasProfile = new kaltura.client.objects.KalturaDetachedResponseProfile();
	camerasProfile.name = "cameras";
	camerasProfile.type = kaltura.client.enums.KalturaResponseProfileType.INCLUDE_FIELDS;
	camerasProfile.fields = "id,name,streamUrl";
	camerasProfile.mappings = [camerasMapping];
	camerasProfile.filter = camerasFilter;

	var eventResourcesFilter = new kaltura.client.objects.KalturaScheduleEventResourceFilter();
	
	var eventResourcesMapping = new kaltura.client.objects.KalturaResponseProfileMapping();
	eventResourcesMapping.parentProperty = "id";
	eventResourcesMapping.filterProperty = "eventIdEqual";

	var eventResourcesProfile = new kaltura.client.objects.KalturaDetachedResponseProfile();
	eventResourcesProfile.name = "eventResources";
	eventResourcesProfile.type = kaltura.client.enums.KalturaResponseProfileType.INCLUDE_FIELDS;
	eventResourcesProfile.fields = "eventId,resourceId,entryId";
	eventResourcesProfile.filter = eventResourcesFilter;
	eventResourcesProfile.mappings = [eventResourcesMapping];
	eventResourcesProfile.relatedProfiles = [camerasProfile];

	this.responseProfile = new kaltura.client.objects.KalturaDetachedResponseProfile();
	this.responseProfile.type = kaltura.client.enums.KalturaResponseProfileType.INCLUDE_FIELDS;
	this.responseProfile.fields = "id,summary,startDate,duration,entryId,entryTemplate,relatedObjects";
	this.responseProfile.relatedProfiles = [eventResourcesProfile];
};

SchedulingManager.prototype.initClient = function(callback) {
	var config = KalturaConfig.config.client;

	KalturaLogger.log('Initializing client');
	this.clientConfig = new kaltura.client.KalturaConfiguration();

	for ( var configKey in config)
		this.clientConfig[configKey] = config[configKey];

	this.clientConfig.setLogger(KalturaLogger);
	this.clientConfig.clientTag = 'scheduling-server-' + os.hostname();

	var This = this;

	var type = kaltura.client.enums.KalturaSessionType.ADMIN;
	this.sessionReady = false;
	this.client = new kaltura.client.KalturaClient(this.clientConfig);
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

SchedulingManager.prototype.loop = function() {
	var pager = new kaltura.client.objects.KalturaFilterPager();
	pager.pageSize = 500;

	var filter = new kaltura.client.objects.KalturaScheduleEventFilter();
	filter.statusEqual = kaltura.client.enums.KalturaScheduleEventStatus.ACTIVE;
	filter.recurrenceTypeNotEqual = kaltura.client.enums.KalturaScheduleEventRecuranceType.RECURRING;
	filter.startDateGreaterThanOrEqual = 0;
	filter.startDateLessThanOrEqual = (60 * 60);

	if (this.lastUpdatedAt) {
		filter.updatedAtGreaterThanOrEqual = this.lastUpdatedAt;
	}

	var This = this;
	This.client.setResponseProfile(This.responseProfile);
	This.client.scheduleEvent.listAction(function(scheduleEventList) {
		This.handleScheduleEventList(scheduleEventList, filter, pager);
	}, filter, pager);
};

SchedulingManager.prototype.handleScheduleEventList = function(scheduleEventList, filter, pager) {

	if (!scheduleEventList) {
		KalturaLogger.error('Client [scheduleEvent.list] system error');
	} else if (scheduleEventList.objectType == 'KalturaAPIException') {
		KalturaLogger.error('Client [scheduleEvent.list][' + scheduleEventList.code + ']: ' + scheduleEventList.message);
	} else {
		var This = this;

		if (scheduleEventList.objects.length == pager.pageSize) {
			pager.pageIndex++;
			This.client.setResponseProfile(This.responseProfile);
			This.client.scheduleEvent.listAction(function(nextScheduleEventsList) {
				This.handleScheduleEventList(nextScheduleEventsList, filter, pager);
			}, filter, pager);
		}
		else {
			setTimeout(function(){
				This.loop();
			}, 5000)
		}

		for (var i = 0; i < scheduleEventList.objects.length; i++) {
			var scheduleEvent = scheduleEventList.objects[i];
			var existingScheduleEvent = This.scheduleEvents.findScheduleEvent(scheduleEvent.id);
			if (existingScheduleEvent === false || existingScheduleEvent.updatedAt < scheduleEvent.updatedAt) {
				if (existingScheduleEvent) {
					This.unschedule(existingScheduleEvent);
				}
    			This.lastUpdatedAt = Math.max(this.lastUpdatedAt, scheduleEvent.updatedAt);
    			This.schedule(scheduleEvent);
			}
		}
	}
};

SchedulingManager.prototype.schedule = function(scheduleEvent) {
	if(!scheduleEvent.relatedObjects.eventResources || !scheduleEvent.relatedObjects.eventResources.objects.length){
		KalturaLogger.log('Event: ' + scheduleEvent.id + ' has no resources');
		return;
	}
	KalturaLogger.log('Scheduling Event: ' + scheduleEvent.id);
	this.scheduleEvents.addScheduleEvent(scheduleEvent);
	
	if (scheduleEvent.objectType == 'KalturaRecordScheduleEvent') {
		this.recordingManager.schedule(scheduleEvent);
	}
	else if (scheduleEvent.objectType == 'KalturaLiveStreamScheduleEvent') {
		this.liveStreamManager.schedule(scheduleEvent);
	}
};

module.exports = SchedulingManager;
