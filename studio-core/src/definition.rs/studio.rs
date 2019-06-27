use stdweb::web::html_element::CanvasElement;
use stdweb::web::{document, CanvasRenderingContext2d};
use stdweb::web::Window;
use super::scroll_canvas;
use super::exterior;
use super::audio;
use super::defaults;

pub struct MixData {
    pub id: String,
    pub description: String,
    pub genre: String,
    pub audio: Vec<audio::Audio>
}

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

        Studio{current_time: 0, playing: false, total_time: defaults::DEFAULT_LENGTH, scroll_time: 0, time_scale: defaults::DEFAULT_TIME_SCALE, tracks: defaults::DEFAULT_TRACKS,
                track_timeline_offset: defaults::TRACKTIMELINEOFFSET, line_height: 0, x_scroll_time: 0, canvas: canvas, ctx: ctx, width: width, height: height,
                scroll_canvas: scroll_canvas::ScrollCanvas{}, exterior: exterior::Exterior{}, audio: vec![]}
    }

    fn resize(&mut self, width: f32, height: f32) {
        self.width = width;
        self.height = height;
        self.line_height = self.height*defaults::LINEHEIGHTPROPORTION;
        self.scroll_canvas.resize(width, height);
        self.exterior.resize(width, height);
    }
    
    fn paint_canvas(&self){
        if self.needs_render == true{
            let y;
            //Render track lines
            for i in 0..self.tracks{
                y = (self.track_timeline_offset + i*self.line_height) // /self.dpr
                self.ctx.set_stroke_style_color(defaults::THEME_B);
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