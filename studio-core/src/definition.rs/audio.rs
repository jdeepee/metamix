use super::effect;

pub struct Audio {
    pub id: String,
    pub start: f32,
    pub end: f32,
    pub audio_id: f32,
    pub effects: Vec<effect::Effect>
}

pub struct StudioAudio{
    pub id: String,
    pub x: f32,
    pub y: f32,
    pub x2: f32,
    pub y2: f32,
    pub colour: String,
    pub name: String,
    pub bpm: f32,
    pub key: String,
    pub track: u32,
    pub x_normalized: f32,
    pub x2_normalized: f32,
    pub length: f32, //size
    pub original_lenth: f32,
    pub y_size: f32,
    pub x_center: f32 //x_middle
    pub effects: Vec<effect::StudioEffect>,
    pub bar_markers: Vec<f32>,
    pub time_scale: f32,
    pub frame_start: f32,
    pub x_offset: f32,
    pub ratio: f32,
    pub curve_values: Vec<f32>,
    pub draw_select_glow: bool,
    pub end: f32,
    pub dpr: f32,
    pub current_width: f32,
    pub audio_start: f32,
    pub audio_end: f32,
    pub start: f32, 
    pub end: f32,
    pub effect_filter: effect::EffectFilter,

    pub rounded_1_x = f32,
    pub rounded_1_x_2 = f32,

    pub rounded_2_x = f32,
    pub rounded_2_x_2 = f32,

    pub rounded_3_x = f32,
    pub rounded_3_x_2 = f32,
}

impl StudioAudio{
    fn new() -> StudioAudio{
        
    }
}