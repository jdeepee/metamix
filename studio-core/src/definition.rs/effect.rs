// "eq": {"start": 0, "end": 0, "startGlobal": 0, "endGlobal": 0, "barCountStart": 0, "barCountEnd": 0, "strengthCurve": "continuous", "title": "EQ Effect",
// 							 "knobs": [{"name": "high", "title": "Highs", "start": 0, "target": 0, "max": 2, "min": 0, "step": 0.01, "precision": 2, "default": 1}, 
// 							 		   {"name": "mid", "title": "Mids", "start": 0, "target": 0, "max": 2, "min": 0, "step": 0.01, "precision": 2, "default": 1}, 
// 							 		   {"name": "low", "title": "Lows", "start": 0, "target": 0, "max": 2, "min": 0, "step": 0.01, "precision": 2, "default": 1}],
// 							 "default_values": {"high": {"start": null, "target": null}, "mid": {"start": null, "target": null}, "low": {"start": null, "target": null}, "strength_curve": "continuous"}},

// 					  "remove": {"start": null, "end": null, "startGlobal": null, "endGlobal": null, "barCountStart": null, "barCountEnd": null, "strengthCurve": null, "title": "Remove", "knobs": [], "default_values": null, "strength_curve": null},

// 					  "cut": {"start": null, "end": null, "startGlobal": null, "endGlobal": null, "barCountStart": null, "barCountEnd": null, "strengthCurve": null, "title": "Remove", "knobs": [], "default_values": null, "strength_curve": null},

// 					  "volume": {"start": 0, "end": 0, "barCountStart": 0, "barCountEnd": 0, "strengthCurve": "continuous", "title": "Volume Modulation",
// 					  		     "knobs": [{"name": "volume", "start": 0, "target": 0, "max": 2, "min": 0, "step": 0.01, "precision": 2, "default": 1}],
// 					  		     "default_values": {"start": null, "target": null, "strength_curve": "continuous"}, "starting": 1},

// 					  "highPass": {"start": 0, "end": 0, "startGlobal": 0, "endGlobal": 0, "barCountStart": 0, "barCountEnd": 0, "strengthCurve": "continuous", "title": "High Pass Filter", "knobs": [{"name": "filter", "start": 0, "target": 0, "max": 15000, "min": 20, "step": 10, "precision": 2, "default": 0}],
// 					  		     "default_values": {"start": null, "target": null, "strength_curve": "continuous"}, "starting": 0},
// 					  "lowPass": {"start": 0, "end": 0, "startGlobal": 0, "endGlobal": 0, "barCountStart": 0, "barCountEnd": 0, "strengthCurve": "continuous", "title": "Low Pass Filter", "knobs": [{"name": "filter", "start": 0, "target": 0, "max": 15000, "min": 20, "step": 10, "precision": 2, "default": 0}],
// 					  		     "default_values": {"start": null, "target": null, "strength_curve": "continuous"}, "starting": 0},
// 					  "pitch": {"start": 0, "end": 0, "startGlobal": 0, "endGlobal": 0, "barCountStart": 0, "barCountEnd": 0, "strengthCurve": "continuous", "title": "Pitch Modulation", "knobs": [{"name": "pitch", "start": 0, "target": 0, "max": 12, "min": -12, "step": 1, "precision": 2, "default": 0}],
// 					  		     "default_values": {"start": null, "target": null, "strength_curve": "continuous"}, "starting": 0},
// 					  "tempo": {"start": 0, "end": 0, "startGlobal": 0, "endGlobal": 0, "barCountStart": 0, "barCountEnd": 0, "strengthCurve": "continuous", "title": "Tempo Modulation", "knobs": [{"name": "tempo", "start": 0, "target": 0, "max": 250, "min": 0, "step": 0.5, "precision": 2, "default": 0}],
// 					  		     "default_values": {"start": null, "target": null, "strength_curve": "continuous"}, "starting": 0}
// 					} //This might not have to be here in Vuex - it might be possible to handle everything in the effect Vue

pub enum EffectType {
    r#Eq{

    },
    Volume{

    },
    HighPass{

    },
    LowPass{

    },
    Pitch{

    },
    Tempo{

    }
}   

pub enum StrengthCurve {
    Continuous,
    Linear
}

pub struct Effect {
    pub id: String,
    pub start: f32,
    pub end: f32,
    pub effect: EffectType,
    pub strength_curve: StrengthCurve
}