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

pub struct StudioEffect {

}

pub enum EffectFilter {
    All,
    r#Eq,
    Volume,
    HighPass,
    LowPass,
    Pitch,
    Tempo
}