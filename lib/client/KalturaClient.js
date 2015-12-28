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
/**
 * The Kaltura Client - this is the facade through which all service actions should be called.
 * @param config the Kaltura configuration object holding partner credentials (type: KalturaConfiguration).
 */
var util = require('util');
var kaltura = require('./KalturaClientBase');
kaltura.objects = require('./KalturaVO');
kaltura.services = require('./KalturaServices');
kaltura.enums = require('./KalturaTypes');

function KalturaClient(config) {
	this.setApiVersion('3.3.0');
	this.setClientTag('node:15-12-28');
	this.init(config);
}

module.exports = kaltura;
module.exports.KalturaClient = KalturaClient;

util.inherits(KalturaClient, kaltura.KalturaClientBase);

/**
 * Base Entry Service
 * @param kaltura.services.KalturaBaseEntryService
 */
KalturaClient.prototype.baseEntry = null;
/**
 * Live Stream service lets you manage live stream entries
 * @param kaltura.services.KalturaLiveStreamService
 */
KalturaClient.prototype.liveStream = null;
/**
 * Session service
 * @param kaltura.services.KalturaSessionService
 */
KalturaClient.prototype.session = null;
/**
 * ScheduleEvent service lets you create and manage schedule events
 * @param kaltura.services.KalturaScheduleEventService
 */
KalturaClient.prototype.scheduleEvent = null;
/**
 * ScheduleEventResource service lets you create and manage connections between events and resources
 * @param kaltura.services.KalturaScheduleEventResourceService
 */
KalturaClient.prototype.scheduleEventResource = null;
/**
 * The client constructor.
 * @param config the Kaltura configuration object holding partner credentials (type: KalturaConfiguration).
 */
KalturaClient.prototype.init = function(config){
	//call the super constructor:
	kaltura.KalturaClientBase.prototype.init.apply(this, arguments);
	//initialize client services:
	this.baseEntry = new kaltura.services.KalturaBaseEntryService(this);
	this.liveStream = new kaltura.services.KalturaLiveStreamService(this);
	this.session = new kaltura.services.KalturaSessionService(this);
	this.scheduleEvent = new kaltura.services.KalturaScheduleEventService(this);
	this.scheduleEventResource = new kaltura.services.KalturaScheduleEventResourceService(this);
};
/**
 * @param string clientTag
 */
KalturaClient.prototype.setClientTag = function(clientTag){
	this.clientConfiguration['clientTag'] = clientTag;
};

/**
 * @return string
 */
KalturaClient.prototype.getClientTag = function(){
	return this.clientConfiguration['clientTag'];
};

/**
 * @param string apiVersion
 */
KalturaClient.prototype.setApiVersion = function(apiVersion){
	this.clientConfiguration['apiVersion'] = apiVersion;
};

/**
 * @return string
 */
KalturaClient.prototype.getApiVersion = function(){
	return this.clientConfiguration['apiVersion'];
};

/**
 * Impersonated partner id
 * 
 * @param int partnerId
 */
KalturaClient.prototype.setPartnerId = function(partnerId){
	this.requestConfiguration['partnerId'] = partnerId;
};

/**
 * Impersonated partner id
 * 
 * @return int
 */
KalturaClient.prototype.getPartnerId = function(){
	return this.requestConfiguration['partnerId'];
};

/**
 * Kaltura API session
 * 
 * @param string ks
 */
KalturaClient.prototype.setKs = function(ks){
	this.requestConfiguration['ks'] = ks;
};

/**
 * Kaltura API session
 * 
 * @return string
 */
KalturaClient.prototype.getKs = function(){
	return this.requestConfiguration['ks'];
};

/**
 * Kaltura API session
 * 
 * @param string sessionId
 */
KalturaClient.prototype.setSessionId = function(sessionId){
	this.requestConfiguration['ks'] = sessionId;
};

/**
 * Kaltura API session
 * 
 * @return string
 */
KalturaClient.prototype.getSessionId = function(){
	return this.requestConfiguration['ks'];
};

/**
 * Response profile - this attribute will be automatically unset after every API call.
 * 
 * @param KalturaBaseResponseProfile responseProfile
 */
KalturaClient.prototype.setResponseProfile = function(responseProfile){
	this.requestConfiguration['responseProfile'] = responseProfile;
};

/**
 * Response profile - this attribute will be automatically unset after every API call.
 * 
 * @return KalturaBaseResponseProfile
 */
KalturaClient.prototype.getResponseProfile = function(){
	return this.requestConfiguration['responseProfile'];
};

/**
 * Clear all volatile configuration parameters
 */
KalturaClient.prototype.resetRequest = function(){
	delete this.requestConfiguration['responseProfile'];
};

