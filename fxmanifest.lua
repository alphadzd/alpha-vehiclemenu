-- © 2024 AlphaDev. All Rights Reserved.

fx_version 'cerulean'
game 'gta5'

description 'Alpha Vehicle Menu - Advanced UI with Dark Purple Theme'
version '1.0.0'
author 'Alpha Works'

ui_page 'html/index.html'

shared_scripts {
    'config.lua'
}

client_scripts {
    'client/main.lua',
}

server_scripts {
    'server/main.lua',
}

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/img/*.png',
    'html/img/*.svg',
}

lua54 'yes'

dependency 'qb-core'