
use super::defaults;
use super::effect;

pub fn interpolate_height(total_height: f32) -> f32 {
    total_height - ((total_height + 128) * total_height) / defaults::AMPLITUDE
}

pub fn time_to_x(time: f32, time_scale: f32, frame_start: f32) -> f32 {
    (time - frame_start) * time_scale
}

pub fn x_to_time(x: f32, time_scale: f32, frame_start: f32) -> f32 {
    frame_start + (x) / time_scale
}

pub fn format_friendly_seconds(s: f32) -> String {
    let raw_secs = s | 0;
    let secs_micro = s % 60.0;
    let secs = raw_secs % 60.0;
    let raw_mins = (raw_secs / 60.0) | 0;
    let mins = raw_mins % 60.0;
    let hours = (raw_mins / 60.0) | 0;  

    let secs_str = format!("{:..2}", (secs / 100))[..2];
    let mut out = format!("{}:{}", mins, secs_str);

    if (s % 1 > 0){
        format!("{:..2}", (s % 1))[..1]
		out = format!("{}{}", out, format!("{:..2}", s % 1)[..1]);   
    }
    out
}

pub fn compute_high_low(start: f32, end: f32, type: &'static str) -> Vec<f32> {
    let mut offset = 0;
    let bounds = defaults::EFFECT_BOUNDS.get(type);
    if (bounds.get("min") <= 0){
        offset = bounds.get("min") * -1;
    } else {
        offset = -bounds.get("min");
    };

    let max = bounds.get("max") * -1;
    let start_offset = start + offset;
    let end_offset = end + offset;

    if (start_offset == 0) {
        vec![0, (end_offset / max)*100]
    } else if (end_offset == 0){
        vec![(start_offset / max)*100, 0]
    } else {
        vec![(start_offset / max)*100, (end_offset / max)*100]
    }
} 

pub fn compute_effect_x(effect: effects::)

function computeEffectsX(effects, startX, time_scale, frame_start){
	for (let i=0; i<effects.length; i++){
		effects[i]["startX"] = startX + effects[i]["start"] * time_scale;
		effects[i]["endX"] = startX + effects[i]["end"] * time_scale;
	}
	return effects;
}