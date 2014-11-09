var WebUIConfig = (function(){
    var config = {};

    // net settings
    config.HOST = "localhost";
    config.HTTP_PORT = "8100";
    config.LOGIN = "admin";
    config.PASSWORD = "1234";
    config.IS_SAVE_PASSWORD_ACTIVE = false;

    // images
    config.IMG_LOADING_PATH = "img/loading.jpg";
    config.IMG_OFFLINE_PATH = "img/offline.jpg";

    config.IMG_BULLET_GRAY = "img/bullet_gray.png";
    config.IMG_BULLET_GREEN = "img/bullet_green.png";
    config.IMG_BULLET_ORANGE = "img/bullet_orange.png";
    config.IMG_BULLET_RED = "img/bullet_red.png";

    return config;
}());