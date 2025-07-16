#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::window_commands::show_main_window,
            commands::window_commands::focus_main_window,
            commands::window_commands::close_help_window,
            commands::window_commands::create_hidden_help_window,
            commands::window_commands::show_hidden_help_window,
            commands::font_commands::get_fonts_from_directory,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
