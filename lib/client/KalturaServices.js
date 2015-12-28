// ===================================================================================================
//                           _  __     _ _
//                          | |/ /__ _| | |_ _  _ _ _ __ _
//                          | ' </ _` | |  _| || | '_/ _` |
//                          |_|\_\__,_|_|\__|\_,_|_| \__,_|
//
// This file is part of the Kaltura Collaborative Media Suite which allows users
// to do with audio, video, and animation what Wiki platfroms allow them to do with
// text.
//
// Copyright (C) 2006-2015  Kaltura Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// @ignore
// ===================================================================================================
var util = require('util');
var kaltura = require('./KalturaClientBase');

/**
 *Class definition for the Kaltura service: baseEntry.
 * The available service actions:
 * @action add Generic add entry, should be used when the uploaded entry type is not known.
 * @action get Get base entry by ID.
 */
function KalturaBaseEntryService(client){
	KalturaBaseEntryService.super_.call(this);
	this.init(client);
}

util.inherits(KalturaBaseEntryService, kaltura.KalturaServiceBase);
module.exports.KalturaBaseEntryService = KalturaBaseEntryService;

/**
 * Generic add entry, should be used when the uploaded entry type is not known.
 * @param entry KalturaBaseEntry  (optional).
 * @param type string  (optional, enum: KalturaEntryType, default: null).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.add = function(callback, entry, type){
	if(!type){
		type = null;
	}
	var kparams = {};
	this.client.addParam(kparams, 'entry', kaltura.toParams(entry));
	this.client.addParam(kparams, 'type', type);
	this.client.queueServiceActionCall('baseentry', 'add', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Get base entry by ID.
 * @param entryId string Entry id (optional).
 * @param version int Desired version of the data (optional, default: -1).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.get = function(callback, entryId, version){
	if(!version){
		version = -1;
	}
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.addParam(kparams, 'version', version);
	this.client.queueServiceActionCall('baseentry', 'get', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};

/**
 *Class definition for the Kaltura service: liveStream.
 * The available service actions:
 * @action add Adds new live stream entry.
 * The entry will be queued for provision.
 */
function KalturaLiveStreamService(client){
	KalturaLiveStreamService.super_.call(this);
	this.init(client);
}

util.inherits(KalturaLiveStreamService, kaltura.KalturaServiceBase);
module.exports.KalturaLiveStreamService = KalturaLiveStreamService;

/**
 * Adds new live stream entry.
 * The entry will be queued for provision.
 * @param liveStreamEntry KalturaLiveStreamEntry Live stream entry metadata (optional).
 * @param sourceType string Live stream source type (optional, enum: KalturaSourceType, default: null).
 * @return KalturaLiveStreamEntry.
 */
KalturaLiveStreamService.prototype.add = function(callback, liveStreamEntry, sourceType){
	if(!sourceType){
		sourceType = null;
	}
	var kparams = {};
	this.client.addParam(kparams, 'liveStreamEntry', kaltura.toParams(liveStreamEntry));
	this.client.addParam(kparams, 'sourceType', sourceType);
	this.client.queueServiceActionCall('livestream', 'add', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};

/**
 *Class definition for the Kaltura service: session.
 * The available service actions:
 * @action start Start a session with Kaltura's server.
 * The result KS is the session key that you should pass to all services that requires a ticket.
 */
function KalturaSessionService(client){
	KalturaSessionService.super_.call(this);
	this.init(client);
}

util.inherits(KalturaSessionService, kaltura.KalturaServiceBase);
module.exports.KalturaSessionService = KalturaSessionService;

/**
 * Start a session with Kaltura's server.
 * The result KS is the session key that you should pass to all services that requires a ticket.
 * @param secret string Remember to provide the correct secret according to the sessionType you want (optional).
 * @param userId string  (optional).
 * @param type int Regular session or Admin session (optional, enum: KalturaSessionType).
 * @param partnerId int  (optional, default: null).
 * @param expiry int KS expiry time in seconds (optional, default: 86400).
 * @param privileges string  (optional, default: null).
 * @return string.
 */
KalturaSessionService.prototype.start = function(callback, secret, userId, type, partnerId, expiry, privileges){
	if(!userId){
		userId = '';
	}
	if(!type){
		type = 0;
	}
	if(!partnerId){
		partnerId = null;
	}
	if(!expiry){
		expiry = 86400;
	}
	if(!privileges){
		privileges = null;
	}
	var kparams = {};
	this.client.addParam(kparams, 'secret', secret);
	this.client.addParam(kparams, 'userId', userId);
	this.client.addParam(kparams, 'type', type);
	this.client.addParam(kparams, 'partnerId', partnerId);
	this.client.addParam(kparams, 'expiry', expiry);
	this.client.addParam(kparams, 'privileges', privileges);
	this.client.queueServiceActionCall('session', 'start', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};

/**
 *Class definition for the Kaltura service: scheduleEvent.
 * The available service actions:
 * @action list List KalturaScheduleEvent objects.
 */
function KalturaScheduleEventService(client){
	KalturaScheduleEventService.super_.call(this);
	this.init(client);
}

util.inherits(KalturaScheduleEventService, kaltura.KalturaServiceBase);
module.exports.KalturaScheduleEventService = KalturaScheduleEventService;

/**
 * List KalturaScheduleEvent objects.
 * @param filter KalturaScheduleEventFilter  (optional, default: null).
 * @param pager KalturaFilterPager  (optional, default: null).
 * @return KalturaScheduleEventListResponse.
 */
KalturaScheduleEventService.prototype.listAction = function(callback, filter, pager){
	if(!filter){
		filter = null;
	}
	if(!pager){
		pager = null;
	}
	var kparams = {};
	if (filter !== null){
		this.client.addParam(kparams, 'filter', kaltura.toParams(filter));
	}
	if (pager !== null){
		this.client.addParam(kparams, 'pager', kaltura.toParams(pager));
	}
	this.client.queueServiceActionCall('schedule_scheduleevent', 'list', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};

/**
 *Class definition for the Kaltura service: scheduleEventResource.
 * The available service actions:
 * @action update Update an existing KalturaScheduleEventResource object.
 */
function KalturaScheduleEventResourceService(client){
	KalturaScheduleEventResourceService.super_.call(this);
	this.init(client);
}

util.inherits(KalturaScheduleEventResourceService, kaltura.KalturaServiceBase);
module.exports.KalturaScheduleEventResourceService = KalturaScheduleEventResourceService;

/**
 * Update an existing KalturaScheduleEventResource object.
 * @param scheduleEventId int  (optional).
 * @param scheduleResourceId int  (optional).
 * @param scheduleEventResource KalturaScheduleEventResource  (optional).
 * @return KalturaScheduleEventResource.
 */
KalturaScheduleEventResourceService.prototype.update = function(callback, scheduleEventId, scheduleResourceId, scheduleEventResource){
	var kparams = {};
	this.client.addParam(kparams, 'scheduleEventId', scheduleEventId);
	this.client.addParam(kparams, 'scheduleResourceId', scheduleResourceId);
	this.client.addParam(kparams, 'scheduleEventResource', kaltura.toParams(scheduleEventResource));
	this.client.queueServiceActionCall('schedule_scheduleeventresource', 'update', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};

