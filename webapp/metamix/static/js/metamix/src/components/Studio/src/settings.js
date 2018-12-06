//Time scale definitions
var DEFAULT_TIME_SCALE = 60;

//Timeline component sizes (% of screen size)
var timelineToolbarHeight = 0.05
var timelineToolbarWidth = 1

var trackColumnWidth = 0.2
var trackColumnHeight = 0.85

var timelineWidth = 0.8
var timelineHeight = 0.85

var topTimelineWidth = 0.8
var topTimelineHeight = 0.6

var lineHeightProportion = 0.22 //This value should be worked out on size of studio vs number of tracks so that we can fill the entire space
var trackTimelineOffset = 40;

//min/max bounds for start/end of effects - EQ is missing min/max bounds for start/target-decibels
var effectBounds = {"volume": {"startMin": 0, "startMax": 1, "endMin": 0, "endMax": 1}, 
                    "high_pass_filter": {"startMin": 20, "startMax": 15000, "endMin": 20, "endMax": 15000}, 
                    "low_pass_filter": {"startMin": 15000, "startMax": 20, "endMin": 15000, "endMax": 20}, 
                    "eq": {"startMin": -2, "startMax": 2, "endMin": -2, "endMax": 2}, 
                    "pitch": {"startMin": -12, "startMax": 12, "endMin": -12, "endMax": 12}, 
                    "tempo": {"startMin": 0, "startMax": 250, "endMin": 0, "endMax": 250}}
                    // "gain": {"startMin": , "startMax": , "endMin": , "endMax": }, "flanger": {"startMin": , "startMax": , "endMin": , "endMax": }, 
                    // "echo": {"startMin": , "startMax": , "endMin": , "endMax": }, "phaser": {"startMin": , "startMax": , "endMin": , "endMax": }, 
                    // "reverb": {"startMin": , "startMax": , "endMin": , "endMax": }}

var effectDefaults = {"eq": {"lowFreq": 200, 'midFreq': 1700, 'highFreq': 6500}}

// Dimensions
module.exports = {
	MARKER_TRACK_HEIGHT: 60,
	TIMELINE_SCROLL_HEIGHT: 0,
	time_scale: DEFAULT_TIME_SCALE, // number of pixels to 1 second
    default_length: 600, // seconds
    trackColumnWidth: trackColumnWidth,
    trackColumnHeight: trackColumnHeight,
    timelineWidth: timelineWidth,
    timelineHeight: timelineHeight,
    topTimelineWidth: topTimelineWidth,
    topTimelineHeight: topTimelineHeight,
    timelineToolbarHeight: timelineToolbarHeight,
    timelineToolbarWidth: timelineToolbarWidth,
    lineHeightProportion: lineHeightProportion,
    trackTimelineOffset: trackTimelineOffset,
    effectBounds: effectBounds
};
