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
    trackTimelineOffset: trackTimelineOffset
};
