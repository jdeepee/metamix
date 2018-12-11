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
var effectBounds = {"volume": {"min": 0, "max": 2, "default": 1}, 
                    "highPass": {"min": 20, "max": 15000, "default": 0}, 
                    "lowPass": {"min": 15000, "max": 20, "default": 0}, 
                    "eq": {"min": -2, "max": 2, "default": 0}, 
                    "pitch": {"min": -12, "max": 12, "default": 0}, 
                    "tempo": {"min": 0, "max": 250, "default": 0}}
                    // "gain": {"startMin": , "startMax": , "endMin": , "endMax": }, "flanger": {"startMin": , "startMax": , "endMin": , "endMax": }, 
                    // "echo": {"startMin": , "startMax": , "endMin": , "endMax": }, "phaser": {"startMin": , "startMax": , "endMin": , "endMax": }, 
                    // "reverb": {"startMin": , "startMax": , "endMin": , "endMax": }}

var effectDefaults = {"eq": {"lowFreq": 200, 'midFreq': 1700, 'highFreq': 6500}}

var theme = {
    // photoshop colors
    a: '#343434',
    b: '#535353',
    c: '#b8b8b8',
    d: '#d6d6d6',
    audioElement: '#4286f4',
    effectColours: {"volume": "#15a071", "high_pass_filter": "#ffff00", "low_pass_filter": "#ffae19", "eq": "#FF5733", "pitch": "#3933FF", 
                    "tempo": "#FF33BB", "gain": "#FF3333", "flanger": "#1DFF2B", "echo": "#1DC8FF", "phaser": "#AD1DFF", 
                    "reverb": "#FF1DA6"}
}

// Dimensions
module.exports = {
    Settings: {
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
        effectBounds: effectBounds,
        theme: theme
    }
};
