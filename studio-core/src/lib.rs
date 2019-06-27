#![feature(proc_macro_hygiene)]
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast; 
use wasm_bindgen::JsValue;
use definition::studio;
extern crate stdweb;

#[wasm_bindgen]
extern "C"{
    
}
// This function is automatically invoked after the wasm module is instantiated.
#[wasm_bindgen(start)]
pub fn run() -> Result<(), JsValue> {
}