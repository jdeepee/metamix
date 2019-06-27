use phf::phf_map;

pub const DEFAULT_TIME_SCALE: f32 = 60;

//Timeline component sizes (% of screen size)
pub const TIMELINETOOLBARHEIGHT: f32 = 0.05;
pub const TIMELINETOOLBARWIDTH: f32 = 1;

pub const TRACKCOLUMNWIDTH: f32 = 0.2;
pub const TRACKCOLUMNHEIGHT: f32 = 0.85;

pub const TIMELINEWIDTH: f32 = 0.8;
pub const TIMELINEHEIGHT: f32 = 0.85;

pub const TOPTIMELINEWIDTH: f32 = 0.8;
pub const TOPTIMELINEHEIGHT: f32 = 0.6;

pub const LINEHEIGHTPROPORTION: f32 = 0.22; //This value should be worked out on size of studio vs number of tracks so that we can fill the entire space
pub const TRACKTIMELINEOFFSET: f32 = 40;

pub const MARKER_TRACK_HEIGHT: f32 = 60;
pub const TIMELINE_SCROLL_HEIGHT: f32 = 0;
pub const DEFAULT_LENGTH: f32 = 600;
pub const DEFAULT_TRACKS: u32 = 4;

pub const THEME_B: String = "#535353";
pub const AMPLITUDE: f32 = 256;

static EFFECT_BOUNDS: phf::Map<&'static str, phf::Map<&'static str, f32>> = phf_map! {
    "volume" => phf_map! {
        "min" => 0,
        "max" => 2,
        "default" => 1
    },
    "high_pass" => phf_map! {
        "min" => 20,
        "max" => 15000,
        "default" => 0
    },
    "low_pass" => phf_map! {
        "min" => 15000,
        "max" => 20,
        "default" => 0
    },
    "eq" => phf_map! {
        "min" => -2,
        "max" => 2,
        "default" => 0
    },
    "pitch" => phf_map! {
        "min" => -12,
        "max" => 12,
        "default" => 0
    },
    "tempo" => phf_map! {
        "min" => 0,
        "max" => 250,
        "default" => 0
    },
};