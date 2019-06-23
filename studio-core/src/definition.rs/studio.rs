use stdweb::web::html_element::CanvasElement;
use stdweb::web::{document, CanvasRenderingContext2d};
use stdweb::web::Window;
use scroll_canvas;
use exterior;
use audio;

const DEFAULT_TIME_SCALE: f32 = 60;

//Timeline component sizes (% of screen size)
const TIMELINETOOLBARHEIGHT: f32 = 0.05;
const TIMELINETOOLBARWIDTH: f32 = 1;

const TRACKCOLUMNWIDTH: f32 = 0.2;
const TRACKCOLUMNHEIGHT: f32 = 0.85;

const TIMELINEWIDTH: f32 = 0.8;
const TIMELINEHEIGHT: f32 = 0.85;

const TOPTIMELINEWIDTH: f32 = 0.8;
const TOPTIMELINEHEIGHT: f32 = 0.6;

const LINEHEIGHTPROPORTION: f32 = 0.22; //This value should be worked out on size of studio vs number of tracks so that we can fill the entire space
const TRACKTIMELINEOFFSET: f32 = 40;

const MARKER_TRACK_HEIGHT: f32 = 60;
const TIMELINE_SCROLL_HEIGHT: f32 = 0;
const DEFAULT_LENGTH: f32 = 600;
const DEFAULT_TRACKS: u32 = 4;

const THEME_B: String = "#535353";
// pub struct MixData {

// }

pub struct Studio {
    pub current_time: f32,
    pub playing: bool,
    pub total_time: f32
    pub scroll_time: f32,
    pub time_scale: f32,
    pub tracks: u32, //This should also be set in Studio component after data has been received and maximum number of tracks is decided
    pub track_timeline_offset: f32, //Offset between top of studio timeline and start of track items
    pub line_height: f32, //Size of track items - this should be compute when Studio component is ran and resized
    pub x_scroll_time: f32,
    pub needs_render: bool,
    pub canvas: CanvasElement,
    pub ctx: CanvasRenderingContext2d,
    pub width: f32,
    pub height: f32,
    pub scroll_canvas: scroll_canvas::ScrollCanvas,
    pub exterior: exterior::Exterior,
    pub audio: Vec<audio::Audio>
}

impl Studio{
    fn new_default(width: f32, height: f32) -> Studio{
        let canvas: CanvasElement = document()
            .query_selector(attr_id)
            .unwrap()
            .unwrap()
            .try_into()
            .unwrap();

        let ctx: CanvasRenderingContext2d = canvas.get_context().unwrap();

        Studio{current_time: 0, playing: false, total_time: DEFAULT_LENGTH, scroll_time: 0, time_scale: DEFAULT_TIME_SCALE, tracks: DEFAULT_TRACKS,
                track_timeline_offset: TRACKTIMELINEOFFSET, line_height: 0, x_scroll_time: 0, canvas: canvas, ctx: ctx, width: width, height: height,
                scroll_canvas: scroll_canvas::ScrollCanvas{}, exterior: exterior::Exterior{}, audio: vec![]}
    }

    fn resize(&mut self, width: f32, height: f32) {
        self.width = width;
        self.height = height;
        self.line_height = self.height*LINEHEIGHTPROPORTION;
        self.scroll_canvas.resize(width, height);
        self.exterior.resize(width, height);
    }
    
    fn paint_canvas(&self){
        if self.needs_render == true{
            let y;
            //Render track lines
            for i in 0..self.tracks{
                y = (self.track_timeline_offset + i*self.line_height) // /self.dpr
                self.ctx.set_stroke_style_color(THEME_B);
                self.ctx.begin_path();
                self.ctx.move_to(0, y);
                self.line_to(self.width, y);
                self.ctx.stroke();
            };

            for audio_item in self.audio{
                let x_start = audio_item.x_start;
                let x_end = audio_item.x_end;
                let y_start = audio_item.y_start;
                let y_end = self.line_height // /self.dpr
            }
        }
    }
}